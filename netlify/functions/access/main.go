package main

import (
	"embed"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/ip2location/ip2location-go/v9"
)

//go:embed db/*
var ip2locationdb embed.FS

func getCountry(ip string) (string, error) {
	f, err := ip2locationdb.Open("db/IP2LOCATION-LITE-DB1.BIN")
	if err != nil {
		return "", err
	}
	defer f.Close()
	ra, ok := f.(ip2location.DBReader)
	if !ok {
		return "", errors.New("invalid reader")
	}
	db, err := ip2location.OpenDBWithReader(ra)
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
	if request.QueryStringParameters["flag"] != "" {
		f, err := ip2locationdb.Open("db/IP2LOCATION-LITE-DB1.BIN")
		if err != nil {
			return &events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
				Body:       fmt.Sprintf(`{"message": "%s"}`, err.Error()),
			}, nil
		}
		defer f.Close()

		fi, err := f.Stat()
		if err != nil {
			return &events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
				Body:       fmt.Sprintf(`{"message": "%s"}`, err.Error()),
			}, nil
		}

		// ra, ok := f.(ip2location.DBReader)
		// if !ok {
		// 	return &events.APIGatewayProxyResponse{
		// 		StatusCode: http.StatusInternalServerError,
		// 		Body:       fmt.Sprint(ra),
		// 	}, nil
		// }
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       fmt.Sprintln(fmt.Sprintln(f.(io.ReadCloser)), fmt.Sprintln(f.(io.ReaderAt))),
		}, nil
	}

	country, err := getCountry(request.RequestContext.Identity.SourceIP)
	if err != nil {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body:       fmt.Sprintf(`{"message": "%s"}`, err.Error()),
		}, nil
	}
	country = strings.ToUpper(country)

	notionAPIEndpoint := "https://api.notion.com/v1/pages/"
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
			"Referrer": {
				"url": "%s"
			}
		}
	}`, FLAGS[country], request.RequestContext.Identity.SourceIP, request.Path, request.RequestContext.Identity.UserAgent, request.RequestContext.Identity.UserAgent, request.Headers["referrer"])

	req, err := http.NewRequest("POST", notionAPIEndpoint, strings.NewReader(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Notion-Version", notionVersion)
	req.Header.Set("Authorization", "Bearer "+notionAPIKey)

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
		// Body:       string(buf),
		Body: country,
		Headers: map[string]string{
			"X-length": fmt.Sprint(len(buf)),
		},
	}, nil
}

func main() {
	lambda.Start(handler)
}
