package main

import (
	"encoding/json"
	"errors"
	"fmt"
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

type PropertyNumber struct {
	Object    string `json:"object"`
	Type      string `json:"type"`
	ID        string `json:"id"`
	Number    int    `json:"number"`
	RequestID string `json:"request_id"`
}

func addLike(id string, v int) error {
	notionAPIEndpoint := fmt.Sprintf("https://api.notion.com/v1/pages/%s/properties/fRbV", id)
	notionVersion := "2022-06-28"
	notionAPIKey := os.Getenv("NOTION_API_KEY")

	req, err := http.NewRequest("GET", notionAPIEndpoint, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Notion-Version", notionVersion)
	req.Header.Set("Authorization", "Bearer "+notionAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New(resp.Status)
	}

	like := &PropertyNumber{}
	if err := json.NewDecoder(resp.Body).Decode(like); err != nil {
		return err
	}

	number := fmt.Sprintf(`{
		"properties": {
			"Like": {
				"number": %d
			}
		}
	}`, like.Number+v)

	notionAPIEndpoint = fmt.Sprintf("https://api.notion.com/v1/pages/%s", id)

	req, err = http.NewRequest("PATCH", notionAPIEndpoint, strings.NewReader(number))
	if err != nil {
		return err
	}

	req.Header.Set("Notion-Version", notionVersion)
	req.Header.Set("Authorization", "Bearer "+notionAPIKey)
	req.Header.Set("Content-Type", "application/json")

	_, err = client.Do(req)
	if err != nil {
		return err
	}

	return nil
}

func get(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
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

func patch(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	id := request.QueryStringParameters["id"]
	action := request.QueryStringParameters["action"]

	if id == "" || action == "" {
		return &events.APIGatewayProxyResponse{StatusCode: http.StatusAccepted, Body: ""}, nil
	}

	var err error
	if action == "like" {
		err = addLike(id, 1)
	} else if action == "unlike" {
		err = addLike(id, -1)
	}
	if err != nil {
		return nil, err
	}

	return &events.APIGatewayProxyResponse{StatusCode: http.StatusOK, Body: action}, nil
}

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	switch request.HTTPMethod {
	case "GET", "get":
		return get(request)
	case "PATCH", "patch":
		return patch(request)
	}

	return &events.APIGatewayProxyResponse{StatusCode: http.StatusMethodNotAllowed}, nil
}

func main() {
	lambda.Start(handler)
}
