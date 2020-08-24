import App from "next/app";
import { TinaCMS, TinaProvider } from "tinacms";
import { GithubClient, TinacmsGithubProvider } from "react-tinacms-github";

const onLogin = async () => {
  const res = await fetch("/api/preview", {
    headers: { Authorization: `Bearer ${localStorage.getItem("tinacms-github-token")}` }
  });

  if (res.status === 200) window.location.href = window.location.pathname;
  else throw new Error((await res.json()).message);
}

const onLogout = () => fetch("/api/reset-preview").then(() => window.location.reload());

export const EditLink = ({ cms }: { cms: TinaCMS }) => (
  <button onClick={() => cms.toggle()}>{cms.enabled ? "Exit Edit Mode" : "Edit This Site"}</button>
);

export default class Site extends App {
  cms: TinaCMS;

  constructor(props) {
    super(props);
    this.cms = new TinaCMS({
      enabled: !!props.pageProps.preview,
      apis: {
        github: new GithubClient({
          proxy: "/api/proxy-github",
          authCallbackRoute: "/api/create-github-access-token",
          clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          baseRepoFullName: process.env.NEXT_PUBLIC_REPO_FULL_NAME,
        }),
      },
      sidebar: props.pageProps.preview,
      toolbar: props.pageProps.preview,
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <TinaProvider cms={this.cms}>
        <TinacmsGithubProvider onLogin={onLogin} onLogout={onLogout} error={pageProps.error}>
          <EditLink cms={this.cms} />
          <Component {...pageProps} />
        </TinacmsGithubProvider>
      </TinaProvider>
    );
  }
}
