const token =
  "eyJraWQiOiJzaCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIyZjk2YzVhZS0xNTBmLTQ5OGYtOTkyOC02Y2VkZDMxODRlOWUiLCJhdWQiOiIxOTkwMTE3YS1lMmIxLTRhYmEtYWFjMi0yNjMwYjlkMmUzNTQiLCJqdGkiOiI3NzRhMzM0NC00ZDQ0LTQ2NjMtYmI4ZS00NGM1YTQwZTg0Y2QiLCJleHAiOjE2ODA4Mjg5MzksIm5hbWUiOiJOb3VyZWRkaW5lIEJBU1NBIiwiZW1haWwiOiJub3VyZWRkaW5lLmJhc3NhQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJOb3VyZWRkaW5lIiwiZmFtaWx5X25hbWUiOiJCQVNTQSIsInNpZCI6ImE5Y2U4NTAzLWY0ZjUtNDFmMC1hOTZkLTc5NzExYWM5MDRjOSIsImRpZCI6MSwiYWlkIjoiOGUwZjk2ODItOWVjOC00YWJkLWExYWEtOTBhZWQ0NGI1NzcxIiwiZCI6eyIxIjp7InJhIjp7InJhZyI6MX0sInQiOjExMDAwfX19.tT6_cbgSfF_JBEFjcHlG6EpYq8MQFdyZuSCa8BFnEPFleH9K2yJJ9v2rctb-dzm2TWzt-xdAmTuZdeBFUWoWSYbALAJ8bYvePmMQ7SRBIeEYW_0hTD-2KRq7HcZGg-r948kc7Puj5x-Qtxhi8ZHyfFzWwWf-9iS-c_wGm5w1fSVplxcsV04MpFNtOQpt2EPxtUUzW_C_0_53NtQSJETwlc8i2BPNtY6R_FnAWrza1Vsk27-ZK6TxJP6SY2DbxAFRAsnlR5Pq1jh0xk_TKl0BRJ8DY3CRT5EViWefGWUY_jQjAe5U9GtucfHZk9txbLWX2gjPQIggck3Jn--d4YM1zA";
const imgContainer = document.createElement("img");

document.getElementsByTagName("body")[0].append(imgContainer);

const response = fetch("https://services.sentinel-hub.com/api/v1/process", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    input: {
      bounds: {
        bbox: [
          13.822174072265625, 45.85080395917834, 14.55963134765625,
          46.29191774991382,
        ],
      },
      data: [
        {
          type: "sentinel-2-l2a",
        },
      ],
    },
    evalscript: `
    //VERSION=3

    function setup() {
      return {
        input: ["B08", "B04"],
        output: {
          bands: 3
        }
      };
    }

    function evaluatePixel(
      sample,
      scenes,
      inputMetadata,
      customData,
      outputMetadata
    ) {
      
      let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04)
    
    if (ndvi<-0.5) return [0.05,0.05,0.05]
    else if (ndvi<-0.2) return [0.75,0.75,0.75]
    else if (ndvi<-0.1) return [0.86,0.86,0.86]
    else if (ndvi<0) return [0.92,0.92,0.92]
    else if (ndvi<0.025) return [1,0.98,0.8]
    else if (ndvi<0.05) return [0.93,0.91,0.71]
    else if (ndvi<0.075) return [0.87,0.85,0.61]
    else if (ndvi<0.1) return [0.8,0.78,0.51]
    else if (ndvi<0.125) return [0.74,0.72,0.42]
    else if (ndvi<0.15) return [0.69,0.76,0.38]
    else if (ndvi<0.175) return [0.64,0.8,0.35]
    else if (ndvi<0.2) return [0.57,0.75,0.32]
    else if (ndvi<0.25) return [0.5,0.7,0.28]
    else if (ndvi<0.3) return [0.44,0.64,0.25]
    else if (ndvi<0.35) return [0.38,0.59,0.21]
    else if (ndvi<0.4) return [0.31,0.54,0.18]
    else if (ndvi<0.45) return [0.25,0.49,0.14]
    else if (ndvi<0.5) return [0.19,0.43,0.11]
    else if (ndvi<0.55) return [0.13,0.38,0.07]
    else if (ndvi<0.6) return [0.06,0.33,0.04]
    else return [0,0.27,0]
   
    }
    `,
  }),
})
  .then((response) => {
    const reader = response.body.getReader();
    return new ReadableStream({
      start(controller) {
        return pump();
        function pump() {
          return reader.read().then(({ done, value }) => {
            // When no more data needs to be consumed, close the stream
            if (done) {
              controller.close();
              return;
            }
            // Enqueue the next data chunk into our target stream
            controller.enqueue(value);
            return pump();
          });
        }
      },
    });
  })
  // Create a new response out of the stream
  .then((stream) => new Response(stream))
  // Create an object URL for the response
  .then((response) => response.blob())
  .then((blob) => URL.createObjectURL(blob))
  // Update image
  .then((url) => {
    imgContainer.classList.add("testMaptest");
    imgContainer.src = url;
  })
  .catch((err) => console.error(err));
