package stationbaord

import (
  "net/http"

//  "handlers"
  "regexp_handler"
)

func init() {
  handler := &regexp_handler.RegexpHandler{}
  //handler.HandleFuncMustCompile("/$", handlers.Index)

  // Use the regexp handler for all incoming requests.
  http.HandleFunc("/", handler.ServeHTTP)
}
