package main

import (
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var query string = `{
    "filter": {
        "property": "hidden",
        "checkbox": {
            "equals": true
        }
    },
    "sorts": [
        {
        "property": "Name",
        "direction": "ascending"
        }
    ]
}`

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	notionAPIEndpoint := "https://api.notion.com/v1/databases/f1eee6b74999424fb7de5b6e2e5367a0/query"
	notionVersion := "2022-06-28"
	notionAPIKey := os.Getenv("NOTION_API_KEY")

	req, err := http.NewRequest("POST", notionAPIEndpoint, strings.NewReader(query))
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
	}, nil
}

func main() {
	lambda.Start(handler)
}
