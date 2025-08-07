import axios, { AxiosRequestConfig } from "axios";

export const trackingData = (subIds: string[], courseIds: string[]) => {
  const data = JSON.stringify({
    userId: subIds,
    courseId: courseIds,
  });

  const trackingApiUrl = process.env.NEXT_PUBLIC_MIDDLEWARE_URL;

  if (!trackingApiUrl) {
    console.error("Tracking API URL is not defined in environment variables.");
    return;
  }
  console.log("Tracking API URL:", trackingApiUrl);
  const config: AxiosRequestConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${trackingApiUrl}/tracking/content/course/status`,
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };

  return axios
    .request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error in tracking API:", error);
      throw error;
    });
};
