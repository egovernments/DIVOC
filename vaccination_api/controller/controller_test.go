package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"testing"
	"net/http/httptest"
)

func TestAuthenticate(t *testing.T) {
	type args struct {
		ctx *gin.Context
	}
	var ctx *gin.Context
	ctx1 := &gin.Context{}
	ctx = ctx1
	ctx1.Request, _ = http.NewRequest("POST", "/auth", strings.NewReader("{}"))
	//w := gin.ResponseWriter{}
	ctx1.Writer = w
	fmt.Printf("%v\n",ctx)
	tests := []struct {
		name string
		args args
	}{
		{
			name: "test",
			args: args{ctx:ctx1},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			print(tt.args.ctx.Request.Method)
			OperatorLogin(ctx) //need to mock writer and assert.
			//ctx.
		})
	}
}