import Head from "next/head";
import { SmallPage, dTitle } from "@components/main";
import { useState } from "react";
import { useEffect } from "react";

export default function () {
    const [hostname, setHostname] = useState(false);

    useEffect(() => {
        setHostname(window.location.hostname == "certple.zeoseven.com");
    }, []);

    return (<>
        <Head>
            <title>{`关于 ${dTitle}`}</title>
        </Head>
        <SmallPage name="关于 Certple">
            <div className="mb-5 fw-bold text-center p-5 rounded-5" style={{ backgroundColor: "#00cc0010" }}>
                <p className="mb-2" style={{ color: "#00cc00" }}>Certple</p>
                <p className="h3" style={{ fontFamily: "serif" }}>简单快速的申请免费 TLS/SSL 证书</p>
            </div>
            <div>
                <p className="mb-4">© 2025-2026 qingqiuyao & wxy</p>
                {hostname && (<>
                    <div className="fs-14 mb-4">
                        <div className="d-flex align-items-center">
                            <img className="icp-beian" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAoCAYAAACWwljjAAAFQklEQVRYw+3Wa1BUdRjH8SOpMeg4WhZGpDIxiaaTeUFgWrxE4AVRQJGlRRAVIV1JkbgMgQLi5AVBQSVLSp0xlEAUKBEEFZCrCstll8UV2AV2YbmoGCrYv31+R95UL5pmmtamZ+bz6rz5nvOc/5zDcX9jGLs/iTxuyvIlWYkRFeTHA2HVRFtzfhthTG5KuH96/vUgNlC4mMgyw1NJit/aAXLKazYje9xtIMZ/OZz50gW+9hcNkvoLEemEPbnrSP47QYwxQ5Ifv54RqzcXwFFvSyjaOhfavN8F7Y5ZcC/HH9JOB4LNa9Zw5YA76OZV8vIGMdZtSp7cDrtOnOavYiQhTAiPwi1AMtIQaqyngsxpBtw2GAGDKfaQmpUAa6xc4Vfp4UtEdzAMycsT9JQ1Tyctl/2eEkuTlYysF/rCUNxMqDEzgTqzSXBnpgnIHCzgjvEEuD52DLBr3rA1MAaWmNtB582wdtIljZ9G9D+IPU6aTxIPBjHCcXvg3CEh9K2fDLWvjIH6D6fwTIyheuwEqLUyhzLOALq8pkN+bgRw3HY4FBsMzxojZxP9DequLjAlQwVrbpIjhyIY4UYGQ/buhdBqPxlk3Gion2IMDQIz3kJe/ZS34I7uHkmD7VSQVgYDNyIAwsNCgfXGXoOBPjP9DKrOCAogA2etGTmTHAMcFwFZye7wS5QlVHGjoEw4A2qPCUBZ6AzNcQ5Q/YYRdO+YB1U3dsDwypLio4FJ3ECryIzWz6Cm3NgTRHN8HiPF6eHAGSbAdh8feFZkB7krzaHE9h2o85sDsiAbkIsXQMN+e2CtGyF0kzdwXCgU5++D/ouLQFV4OEU/g2Q/iNuIPNaKkQflAWBqexxGjhLDVUcL6IwSQN3SGVChe6FJg9dckCx6D1QBliDZLIAxo7eA8eyv4KE0BJqTrHkZvnL9DJKn+Twmt0NsGGHZy2Dn3kQYfsQ53Hh4/r4RNGz8AIpdzKEuaAF0RC2E57MmQgE3ATjuM/CPiANW7AqSfQJQ5vk362eQKmd3JrmXsoSRocpNIMnbB9zbceDIWUPmuHFQNMkISqa9DpUvNK6YDpW2s8DfwBK48WFQnhMCgzUBoLy0BrRVe5P0NWjPLdKUsJiR1tR1wGp8IeZwMgx/SrgRvjxuAziNcwLvyathLOcJHLflhRDYGRYFrNET2rJ5yvPLoas0tOj/oL8UpC4JHyTSU+6MNCS4gvKoAB5WiKG+MAQSg0WwLXQ/ZJ3xhao0FxB5hYCbUwAEfhEF3Td8QP2dAOQnPwFlxgrolUVq9TPoaX+ZB2nLc2Gk6awj1MU78HZZwJMid2Byb550JQwVO0NfxlJgdz14vWKeRAiK6DlQF28PLZdcoLNcBIO92bb6GTQ8Q/13RURT6tlH2gvXMlITLYD6uI+gp2ozdF0VQXumM6ivCqGvahM8kPiDItkeGo8tB025GFQ3xFrSr06zI3/4yde7oN7m0sWk5eKWDqK5JWJQvAHac9ygq3Adr9gTNNc3QG85rzPfHe5/7wDtPwuhp/Zz6CjyhaZzwi6ivfetHdH/oP77+3PJQOsuRnqkQdCa4wWqyx6gyecpL64GTaEX7ycXUJz4GJp1B4O0X/Hg0Xp1tFV+8Ei1k6c5coHofxBrrzQinbKYo0SVJ+wn6iurGHlY5gY911aDJnMFaHXXiDp9GQyvtKfUA9QFTtBZ7gPdit0tpFd9OpwwFmlA9D/o9yNLDpxIKmI8PMnNSNtviCLVpYTITzrXEGWaq4qos0WgOPdpCenIF+eRrurjB4k0PXopYZG6gMg/D/gNBUxhAbSAmKMAAAAASUVORK5CYII=" />
                            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=41130302000659" rel="noreferrer" target="_blank">豫公网安备41130302000659号</a>
                        </div>
                        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">豫ICP备2024064405号</a>
                    </div>
                </>)}
                <div className="fs-12 color-9">
                    <p>Next.js: ^16</p>
                    <p>React: ^19</p>
                    <p>ACME HTML Web Browser Client: 1.0.230820</p>
                    <p>Bootstrap: ^5</p>
                </div>
            </div>
        </SmallPage>
    </>);
};