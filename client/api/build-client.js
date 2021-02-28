import axios from "axios";

export default function buildClient({ req }) {
  if (typeof window === "undefined") {
    // on server
    return axios.create({
      baseURL: "http://ingress-nginx-controller.kube-system.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // on browser
    return axios.create({ baseURL: "/" });
  }
}
