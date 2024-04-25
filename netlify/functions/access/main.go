package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/ip2location/ip2location-go/v9"
)

//go:embed db/IP2LOCATION-LITE-DB1.BIN
var ip2locationdb []byte

type DBReader struct {
	*bytes.Reader
}

func (r *DBReader) Close() error {
	return nil
}

func getCountry(ip string) (string, error) {
	r := &DBReader{
		bytes.NewReader(ip2locationdb),
	}

	db, err := ip2location.OpenDBWithReader(r)
	if err != nil {
		return "", err
	}
	record, err := db.Get_country_short(ip)
	if err != nil {
		return "", err
	}

	return record.Country_short, nil
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	//cf-connecting-ip:223.39.181.245 cf-ipcountry:KR
	headers := http.Header(request.MultiValueHeaders)

	ip := headers.Get("cf-connecting-ip")
	country := headers.Get("cf-ipcountry")
	userAgent := headers.Get("user-agent")
	referer := headers.Get("referer")
	if referer == "" {
		referer = "Direct"
	}
	// country, err := getCountry(request.RequestContext.Identity.SourceIP)
	// if err != nil {
	// 	return &events.APIGatewayProxyResponse{
	// 		StatusCode: http.StatusInternalServerError,
	// 		Body:       fmt.Sprintf(`{"message": "%s"}`, err.Error()),
	// 	}, nil
	// }
	// country = strings.ToUpper(country)

	notionAPIEndpoint := "https://api.notion.com/v1/pages"
	notionVersion := "2022-06-28"
	notionAPIKey := os.Getenv("NOTION_API_KEY")

	body := fmt.Sprintf(`{
		"icon": {
		  "type": "emoji",
		  "emoji": "%s"
		},
		"parent": {
			"database_id": "f2588bf496de43aca5e5791f5e75cef8"
		},
		"properties": {
			"IP": {
				"title": [
					{
						"text": {
							"content": "%s"
						}
					}
				]
			},
			"URL": {
				"url": "%s"
			},
			"UserAgent": {
				"rich_text": [
					{
						"type": "text",
						"text": {
							"content": "%s",
							"link": null
						},
						"annotations": {
							"bold": false,
							"italic": false,
							"strikethrough": false,
							"underline": false,
							"code": false,
							"color": "default"
						},
						"plain_text": "%s",
						"href": null
					}
				]
			},
			"Referer": {
				"url": "%s"
			}
		}
	}`, FLAGS[country], ip, request.Path, userAgent, userAgent, referer)

	req, err := http.NewRequest("POST", notionAPIEndpoint, bytes.NewReader([]byte(body)))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Notion-Version", notionVersion)
	req.Header.Set("Authorization", "Bearer "+notionAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	buf, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(buf),
		// Body: body,
		// Body: fmt.Sprint(request.Headers),
		Headers: map[string]string{
			"X-length": fmt.Sprint(len(buf)),
		},
	}, nil
}

func main() {
	lambda.Start(handler)
}
