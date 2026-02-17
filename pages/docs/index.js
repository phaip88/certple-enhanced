import Head from "next/head";
import { dTitle, ImageFix, SmallPage } from "@components/main";

import IMG_01 from "@components/images/docs/01.webp";
import IMG_02 from "@components/images/docs/02.webp";
import IMG_03 from "@components/images/docs/03.webp";

export default function () {

    const H2 = ({ children }) => {
        return (<>
            <h2 id={children}><a href={`#${children}`}>#</a><span className='ms-2'>{children}</span></h2>
        </>)
    };

    const H4 = ({ children }) => {
        return (<>
            <h4 id={children}><a href={`#${children}`}>#</a><span className='ms-2'>{children}</span></h4>
        </>)
    };

    const A = ({ children }) => {
        return (<>
            <a href={`#${children}`}>{children}</a>
        </>)
    };

    return (<>
        <Head>
            <title>{`文档 - ${dTitle}`}</title>
        </Head>
        <SmallPage name="文档">
            <div className="documents">
                <div className="mb-5">Certple 中的一切高级方法和限制都基于 Certple 的证书颁发机构 Let's Encrypt 的 <a href="https://letsencrypt.org/zh-cn/docs/#%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF" target="_blank" rel="noopener nofollow">高级用户信息</a> 和 <a href="https://letsencrypt.org/zh-cn/docs/rate-limits/" target="_blank" rel="noopener nofollow">速率限制</a> ，这是不可避免的防止滥用措施。</div>

                <h3 className="fw-light">目录</h3>
                <div className="px-4 mulu">
                    <A>首次申请证书</A>
                    <div className="ps-4">
                        <A>域名</A>
                        <A>域名格式示例</A>
                        <A>高级选项 - 证书类型(私钥)</A>
                        <A>验证域名所有权</A>
                    </div>
                    <A>主机记录格式</A>
                    <div className="ps-4">
                        <A>主机记录格式 - 原理</A>
                    </div>
                    <A>极速续期</A>
                    <div className="ps-4">
                        <A>极速续期 - 原理</A>
                    </div>
                </div>

                <div>
                    <H2>首次申请证书</H2>
                    <p>首次申请证书可能相对缓慢，并没有续期时极速颁发的高效率。</p>
                    <p>首先，在 <a href="/" target="_blank">申请证书</a> 页面，您可能会看到这样的内容：</p>
                    <ImageFix src={IMG_01} />

                    <H4>域名</H4>
                    <p>多个域名以 <strong>英文逗号(,)</strong> 分隔。</p>
                    <p><strong>您输入的域名越多，需要提供的验证凭据越多，因为它们需要逐个验证，所以如果不是特殊需求而使用多域名证书，则更推荐通配符证书，因为通配符证书只需要提供两个凭据。</strong></p>
                    <p>域名填写裸域，比如 <strong>example.org, *.example.org</strong> 即可申请覆盖主域 example.org 及子域 blog.example.org、bbs.example.org 等域名的 TLS/SSL 证书。</p>
                    <p>申请通配符证书需要向 DNS 添加 2 个相同主机记录但记录值不同的 TXT 记录。</p>
                    <p>您也可以精确匹配，比如只输入 www.example.org 来申请只覆盖 www 的单域名证书，或者输入 example.org, blog.example.org 来申请只覆盖主域名和 Blog 域名的多域名证书，但多域名证书通常直接使用通配符证书。</p>

                    <H4>域名格式示例</H4>
                    <p>比如 ZeoSeven 的主站域名是 zeoseven.com ，而 Certple 的域名是 certple.zeoseven.com ，它是 zeoseven.com 的子域名，那么如果我想要只覆盖它们，就可以在域名框中输入：</p>
                    <pre>
                        {`zeoseven.com, certple.zeoseven.com`}
                    </pre>
                    <p>然而， ZeoSeven 还有一个 fonts.zeoseven.com ，如果想要覆盖它们，可以填写：</p>
                    <pre>
                        {`zeoseven.com, certple.zeoseven.com, fonts.zeoseven.com`}
                    </pre>
                    <p>不过，通配符证书只需要添加两个 TXT 记录或文件，而这样则需要添加三个，如果子域名特别多呢？不可能一个一个验证，那样实在是过于麻烦，那么可以用 通配符(*) 。</p>
                    <pre>zeoseven.com, *.zeoseven.com</pre>
                    <p>这样以来，即可覆盖包括 zeoseven.com, www.zeoseven.com, certple.zeoseven.com, fonts.zeoseven.com ，甚至不使用的 bbs.zeoseven.com, api.zeoseven.com, blog.zeoseven.com 等一切子域名都可使用同一个 PEM 和 KEY 来开启 HTTPS 。</p>
                    <p>当然，因为 通配符(*) 匹配任何字符的特性，可以更方便的覆盖所有子域，但如果是 *.zeoseven.com ，则实际上只匹配 .zeoseven.com 前面任何英文字母和连字符，但如果遇到子域名的子域名，如：</p>
                    <pre>
                        {`pan.blog.zeoseven.com`}
                    </pre>
                    <p>那么它将不会被匹配，因为通配符(*) 只匹配到 zeoseven.com 前面，而不会匹配到 blog.zeoseven.com 前面，所以需要添加：</p>
                    <pre>
                        {`zeoseven.com, *.zeoseven.com, *.blog.zeoseven.com`}
                    </pre>
                    <p>需要注意：证书中的 通配符(*) 每 1 段域名或子域名只能使用 1 个，所以 *.*.zeoseven.com 是不可用的。</p>

                    <H4>高级选项 - 证书类型(私钥)</H4>
                    <p>通常选择自动，如果您的服务器是相对较新的版本，支持 ECC 椭圆加密算法，那么应该选择 ECC ，因为它提供更好的安全性和效率。而 RSA 因存在历史较 ECC 更久远，所以 <strong>RSA 的兼容性更强，但效率并不如 ECC</strong> 。</p>

                    <H4>验证域名所有权</H4>
                    <p>以 certple.zeoseven.com 为例，当在输入信息页面点击 “继续” 按钮后， Certple 会输出需要验证的信息详情和选择验证方法。</p>
                    <p>不论什么， Certple 更推荐使用 DNS 记录验证，因为它通常来说相对其它验证方式更容易。</p>
                    <p>输出的信息看起来像这样：</p>
                    <ImageFix src={IMG_02} />
                    <p>请先阅读 <A>主机记录格式</A> 了解添加规则，<strong>否则可能在不够智能的 DNS 控制台中导致隐性错误。</strong></p>
                    <p>前往您的域名权威 DNS 服务器中添加 TXT 记录，输出的所有记录值都需要逐个添加，但通常申请的通配符域名证书只需要添加两个 TXT 主机记录。</p>
                    <p><strong>建议在添加全部 TXT 记录后，不要急于点击开始验证按钮，等待 30 秒左右再点击，以缓解 DNS 传播的延迟。</strong>否则如果至多一个记录验证失败，则验证不通过，需要重新添加新的记录值。</p>
                    <p>如果一切顺利，您应该会看到 PEM 和 KEY 的输出页面：</p>
                    <ImageFix src={IMG_03} />

                </div>

                <div>
                    <H2>主机记录格式</H2>
                    <p>Certple 无法智能的猜到一切裸域名，因为它们可能是多级的，所以需要输出完整主机记录，否则可能导致提供的记录缺失。</p>
                    <p><b>固定规则公式：</b></p>
                    <pre>
                        {`需要验证的 TXT 主机记录 - 权威 DNS 的根域名 = 最终添加到 DNS 的主机记录`}
                    </pre>
                    <p>如果看到需要验证的主机记录是 <b>_acme-challenge.zeoseven.com</b> ，则去除权威 DNS 根域名 zeoseven.com 后应该添加的 TXT 记录为： _acme-challenge 。</p>
                    <p>或者是子域，如 www.zeoseven.com ，那么您看到的需要验证主机记录会是 <b>_acme-challenge.www.zeoseven.com</b> ，则去除权威 DNS 根域名 zeoseven.com 后应该添加的 TXT 记录为： _acme-challenge.www 。</p>
                    <p><strong>权威 DNS 根域名 ≠ 注册域名</strong>，因为权威 DNS 的根域名也可以是另一个域的子域名，如 sub.eu.org ，通常来说，没有 eu.org 的权威 DNS 控制权，但拥有 sub.eu.org 的权威 DNS 控制权，那么 sub.eu.org 就是权威 DNS 根域名，这时候验证 www.sub.eu.org 的 <b>_acme-challenge.www.sub.eu.org</b> 时，添加的 TXT 记录应为 <b>_acme-challenge.www</b> 而不是 <b>_acme-challenge.www.sub</b> 。</p>

                    <H4>主机记录格式 - 原理</H4>
                    <p>和添加 A / AAAA / CNAME 记录一样，主机记录只需要添加 www 即可解析为 www.example.org ，那么 TXT 记录同理。</p>
                    <p>经对热门权威 DNS 控制台的测试， Cloudflare® 和 阿里云® 的权威 DNS 服务器控制台相对智能，如果您直接添加需要验证的完整 TXT 主机记录，它们会自动去除或提醒。而 腾讯云® 的权威 DNS 服务器控制台 相对自由，它不会去除或合并，那么就需要注意，否则添加完整 TXT 主机记录可能解析为 <b>_acme-challenge.example.org.example.org</b> ，而导致验证 <b>_acme-challenge.example.org</b> 记录失败。</p>
                </div>

                <div>
                    <H2>极速续期</H2>
                    <p>如果首次申请证书时一切顺利并成功输出 TLS/SSL 证书，也没有删除首次验证域名所添加的 TXT 记录，这时，不去修改域名的输入，即便是开始验证阶段，也无需等待直接继续，极速续期来输出 TLS/SSL 证书！</p>
                    <p>不过，如果通过验证时间距离续期时已有较长时间，需要注意续期时可能存在不同值的问题，需要重新添加新的值进行验证。</p>
                    <H4>极速续期 - 原理</H4>
                    <p>如果查阅过 <a href="../settings/">设置</a> 页面，可能会注意到一个叫做 “ACME 账户私钥” 的数据，它可以被看作是 Let's Encrypt 账户。</p>
                    <p>比如在 账户 A 中验证了域名 zeoseven.com 和 *.zeoseven.com 的所有权(成功颁发证书) ，那么 Let's Encrypt 账户会记住，<strong>并在续期时要求和申请时一样的验证凭据</strong>，通常是 <strong>DNS 中使用相同的 TXT 记录值</strong> 。</p>
                    <p>但如果清除了浏览器数据或者更换了设备或浏览器，虽然 Certple 会自动在没有账户的浏览器中再创建一个新的 账户 B ，但即便在 账户 A 验证的所有权，在 账户 B 也不会存在，不过可以在设置页面使用导入/导出数据来做到。</p>
                    <p>既然续期时的要求是和申请时一样的验证凭据，那么如果不删除申请证书时的凭据(如申请时添加的用于验证所有权的 DNS 记录) ，再申请相同域名时，就可以省去 DNS 传播延迟的等待时间，做到快速颁发。</p>
                </div>
            </div>
        </SmallPage>
    </>);
};