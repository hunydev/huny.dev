package main

import (
	"fmt"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	var sb strings.Builder
	sb.WriteString("MultiValueHeaders\n")
	sb.WriteString(fmt.Sprintln(request.MultiValueHeaders))

	sb.WriteString("PathParameters\n")
	sb.WriteString(fmt.Sprintln(request.PathParameters))

	sb.WriteString("Path\n")
	sb.WriteString(fmt.Sprintln(request.Path))

	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"x-dev-test": "ok",
		},
		Body: sb.String(),
	}, nil
}

func main() {
	lambda.Start(handler)
}
