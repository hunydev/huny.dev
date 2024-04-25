package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/mileusna/useragent"
)

type DBReader struct {
	*bytes.Reader
}

func (r *DBReader) Close() error {
	return nil
}

// func getCountry(ip string) (string, error) {
// 	r := &DBReader{
// 		bytes.NewReader(ip2locationdb),
// 	}

// 	db, err := ip2location.OpenDBWithReader(r)
// 	if err != nil {
// 		return "", err
// 	}
// 	record, err := db.Get_country_short(ip)
// 	if err != nil {
// 		return "", err
// 	}

// 	return record.Country_short, nil
// }

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	//cf-connecting-ip:223.39.181.245 cf-ipcountry:KR
	headers := http.Header(request.MultiValueHeaders)

	method := request.HTTPMethod
	var queryBuilder strings.Builder

	for k, v := range request.QueryStringParameters {
		if queryBuilder.Len() != 0 {
			queryBuilder.WriteString("&")
		}

		queryBuilder.WriteString(fmt.Sprintf("%s=%s", k, v))
	}
	query := queryBuilder.String()

	ip := headers.Get("cf-connecting-ip")
	country := headers.Get("cf-ipcountry")
	agent := useragent.Parse(headers.Get("user-agent"))
	referer := headers.Get("referer")
	if referer == "" {
		referer = "Direct"
	}

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
			"Referer": {
				"url": "%s"
			},
			"Method": {
				"rich_text": [
					{
						"text": {
							"content": "%s"
						}
					}
				]
			},
			"OS": {
				"rich_text": [
					{
						"text": {
							"content": "%s"
						}
					}
				]
			},
			"Browser": {
				"rich_text": [
					{
						"text": {
							"content": "%s"
						}
					}
				]
			},
			"Query": {
				"rich_text": [
					{
						"text": {
							"content": "%s"
						}
					}
				]
			}
		}
	}`, FLAGS[country], ip, referer, method, agent.OS, agent.Name, query)

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
