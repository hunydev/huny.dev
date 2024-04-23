package main

import (
	"io"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	notionAPIEndpoint := "https://api.notion.com/v1/comments?block_id=5c8bcdb8a0fa4bb784c104ffa7ff765c"
	notionVersion := "2022-06-28"
	notionAPIKey := os.Getenv("NOTION_API_KEY")

	req, err := http.NewRequest("GET", notionAPIEndpoint, nil)
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
		Body:       string(buf),
	}, nil
}

func main() {
	lambda.Start(handler)
}
