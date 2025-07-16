import { AxiosError } from "axios";
import { ApiError } from "./apiError";

export function axiosErrorHandler(error: AxiosError) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    /* console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers); */
    let data = error.response.data as ApiError;
    return {
      error: data.message,
      message: data.message,
    };
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser
    // and an instance of http.ClientRequest in node.js
    console.log(error.request);
    return {
        error: "No Response from Server",
        message: "No Response from Server",
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
    return {
      error: "Error in request",
      message: "Error in request",
    };
  }
}
