import axios from "axios";

function LandingPage({ currentUser }) {
  // console.log(currentUser);
  // axios.get("/api/users/currentuser");
  console.log(currentUser);
  return <h1>Landing page !!!</h1>;
}

LandingPage.getInitialProps = async ({ req }) => {
  if (typeof window === "undefined") {
    const { data } = await axios.get(
      `http://ingress-nginx-controller.kube-system.svc.cluster.local/api/users/currentuser`,
      {
        headers: req.headers,
      }
    );

    return data;
  } else {
    const { data } = await axios.get(`/api/users/currentuser`);

    return data;
  }
};

export default LandingPage;
