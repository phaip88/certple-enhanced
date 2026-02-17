import Head from 'next/head';
import depend from '@components/core';
import { zsQ, dTitle, copy, SmallPage } from '@components/main';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default () => {

  const router = useRouter();

  // 防止因离开页面导致的中断
  useEffect(() => {
    let userStart = false;
    document.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        userStart = true;
      });
    });
    const stopGo = () => {
      if (userStart) {
        if (!confirm('确定要离开吗？你所做的一切将会被终止 ...')) {
          throw false;
        };
      };
    };
    router.events.on('routeChangeStart', stopGo);
    return () => {
      router.events.off('routeChangeStart', stopGo);
    };
  }, [router]);



  useEffect(() => {

    // 首先执行 ACME 依赖
    depend();



    // 定义计时器并暴露给 useEffect 用于卸载
    let timer_0, timer_1, timer_2, timer_3;



    // 首页到开始的域名填充
    const domain = zsQ.getQuery('domain');
    const type = zsQ.getQuery('type') || '1';
    if (domain && type) {
      const domainOut = domain.replace(/^(https?:\/\/)?/, '');
      let domainValue = '';
      if (type === '1') {
        const result = (domainOut.split(',')[0]).replace(/^www\./, '');
        const out = `*.${result}, ${result}`;
        domainValue = out.split('*.*.').filter(Boolean).join('')
      } else {
        domainValue = domainOut;
      }
      timer_0 = setTimeout(() => {
        document.querySelector('#x-q-domain').value = domainValue;
      }, 100);
    };



    // 前往设置后，如果发生改变，立即重新输入账户私钥值
    window.addEventListener('storage', function (event) {
      if (event.key === 'q-acmeAccountKey') {
        document.querySelector('.in_accountKey').value = event.newValue;
      };
    });
    // 自动创建填充和记忆账户私钥
    const storageAccountKey = localStorage.getItem('q-acmeAccountKey');
    const accountKey = document.querySelector('.in_accountKey');
    if (!storageAccountKey || storageAccountKey === '') {
      document.querySelector('input[name="choice_accountKey"][value="generateECC"]').click();
      const trySet = setInterval(() => {
        if (accountKey.value) {
          localStorage.setItem('q-acmeAccountKey', accountKey.value);
          clearInterval(trySet);
        };
      }, 100);
    } else {
      timer_1 = setTimeout(function () {
        accountKey.value = storageAccountKey;
      }, 500);
      accountKey.value = storageAccountKey;
    };



    // 自动创建和监听证书类型
    const privateKey = document.getElementById('q-privateKey-userInput');
    timer_2 = setTimeout(() => {
      document.querySelector('input[name="choice_privateKey"][value="generateRSA"]').click();
    }, 1000);
    document.getElementById('q-privateKey-auto').addEventListener('change', function () {
      document.querySelector('input[name="choice_privateKey"][value="generateRSA"]').click();
      privateKey.style.display = 'none';
    });
    document.getElementById('q-privateKey-ecc').addEventListener('change', function () {
      document.querySelector('input[name="choice_privateKey"][value="generateECC"]').click();
      privateKey.style.display = 'none';
    });
    document.getElementById('q-privateKey-rsa').addEventListener('change', function () {
      document.querySelector('input[name="choice_privateKey"][value="generateRSA"]').click();
      privateKey.style.display = 'none';
    });
    document.getElementById('q-privateKey-user').addEventListener('change', function () {
      document.querySelector('input[name="choice_privateKey"][value="manual"]').click();
      privateKey.style.display = '';
      privateKey.addEventListener('blur', function () {
        timer_3 = setTimeout(() => {
          document.querySelector('.in_privateKey').value = privateKey.value;
        }, 50);
        return () => { clearTimeout(timer) };
      });
    });



    // 记忆域名和邮箱
    const domainAndEmailInputs = document.querySelectorAll("#x-q-domain, #x-q-email");
    function fillSavedInputData() {
      domainAndEmailInputs.forEach(input => {
        input.value = localStorage.getItem(input.id) || "";
      });
    };
    fillSavedInputData();
    domainAndEmailInputs.forEach(input => {
      input.addEventListener("input", () => {
        localStorage.setItem(input.id, input.value);
      });
    });

    document.querySelector('.step1-main-btn').addEventListener('click', function () {
      const domainValue = document.getElementById('x-q-domain').value;
      let domainArray = localStorage.getItem('q-domainArray');
      domainArray = domainArray ? JSON.parse(domainArray) : [];
      if (domainArray.indexOf(domainValue) === -1) {
        domainArray.push(domainValue);
        localStorage.setItem('q-domainArray', JSON.stringify(domainArray));
      }
    });
    const domainArray = localStorage.getItem('q-domainArray');
    if (domainArray) {
      const domainArrayObj = JSON.parse(domainArray);
      domainArrayObj.forEach(function (domain) {
        let option = document.createElement('option');
        option.value = domain;
        document.getElementById('x-q-domain-datalist').appendChild(option);
      });
    };




    let userStart = false;
    document.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        userStart = true;
      });
    });
    window.addEventListener('beforeunload', function (e) {
      if (userStart) {
        (e || window.event).returnValue = '你所做的更改可能未保存。';
      };
    });







    // PEM 和 KEY 的复制按钮
    const txtKey = document.querySelector('.txt_downloadKey');
    const txtPem = document.querySelector('.txt_downloadCert');
    document.getElementById('x-q-copy-textpem').addEventListener('click', function () {
      copy(txtPem.value);
    });
    document.getElementById('x-q-copy-textkey').addEventListener('click', function () {
      copy(txtKey.value);
    });



    // 组件卸载时卸载计时器

    return () => {
      clearTimeout(timer_0);
      clearTimeout(timer_1);
      clearTimeout(timer_2);
      clearTimeout(timer_3);
      userStart = false;
    };



  }, []);

  return (<>
    <Head>
      <title>{`申请证书 - ${dTitle}`}</title>
    </Head>
    <SmallPage name="申请证书">
      <p className='mb-5 fs-14'>需要帮助吗？ Certple 提供了 <a href='/docs/' target='_blank'>文档</a> 和 <a href="https://www.bilibili.com/video/BV1KRBuYrEjo/" rel="noopener" target="_blank">视频</a> 。</p>



      <div id="q-steps1">
        <div className="d-none">
          <div>
            <label>
              <input type="radio" name="choice_acmeURL" value="https://acme-v02.api.letsencrypt.org/directory" desckey="descLetsEncrypt" />Let's Encrypt
            </label>
          </div>
          <div className="input-group">
            <input className="in_acmeURL inputLang form-control q-form" placeholder-cn="请填写证书颁发机构 ACME 服务 URL" style={{ border: '#9914ff 1px solid' }} />
            <button className="mainBtn mainBtnMin btn-q" onClick={() => { acmeReadDirClick(); }}>
              <span className="langCN">重新检测</span>
            </button>
          </div>
        </div>
        <zsQ.Loading />
        <div className="acmeReadDirState"></div>
      </div>



      <div id="q-steps2" style={{ display: 'none' }}>
        <div className="step2Hide step1Show">
          <zsQ.Loading text="等待 ..." />
        </div>
        <div className="step1Hide step2Show">

          <div className="mb-4">
            <label htmlFor="x-q-domain">域名</label>
            <input id="x-q-domain" list="x-q-domain-datalist" className="in_domains inputLang form-control q-form" placeholder-cn="example.org, *.example.org" />
            <datalist id="x-q-domain-datalist"></datalist>
            <p className="fs-12">多域名证书或其它域名输入问题可参阅 <a href="../documents/#域名" target="_blank">文档 - 域名</a> 。</p>
          </div>

          <div className="form-check d-none">
            <input className="form-check-input choice_domains_store" type="checkbox" id="q-steps2-checkbox1" />
            <label className="form-check-label" htmlFor="q-steps2-checkbox1">
              在此浏览器记住输入的域名
            </label>
          </div>

          <div className='d-none'>
            <label>
              <input type="radio" name="choice_accountKey" value="generateRSA" />
              <span>立即创建账户 RSA 私钥</span>
            </label>
            <label>
              <input type="radio" name="choice_accountKey" value="generateECC" />
              <span>立即创建账户 ECC 私钥</span>
            </label>
            <label>
              <input type="radio" name="choice_accountKey" value="manual" />
              <span className="ms-2">输入账户私钥</span>
            </label>
            <div className="accountKeyBox mb-2">
              <textarea className="in_accountKey inputLang" placeholder-cn="..."></textarea>
            </div>
            <div className="accountKeyState fs-12 d-none"></div>

            <label>
              <input type="radio" name="choice_privateKey" value="generateRSA" />
              <span className="ms-2">创建 RSA 证书私钥</span>
            </label>
            <label>
              <input type="radio" name="choice_privateKey" value="generateECC" />
              <span className="ms-2">创建 ECC 证书私钥</span>
            </label>
            <label>
              <input type="radio" name="choice_privateKey" value="manual" />
              <span className="ms-2">输入证书私钥</span>
            </label>
            <div className="privateKeyBox mb-2">
              <textarea className="in_privateKey inputLang" placeholder-cn="..."></textarea>
            </div>
            <div className="privateKeyState fs-12 d-none"></div>
          </div>

          <div className="mb-4">
            <label htmlFor="x-q-email">电子邮箱地址</label>
            <div className="FlexBox">
              <div className="FlexItem">
                <input className="in_email inputLang form-control q-form" id="x-q-email"
                  placeholder-cn="name@example.org" />
                <div className="form-check d-none">
                  <input className="form-check-input choice_email_store" type="checkbox" id="q-steps2-checkbox4" />
                  <label className="form-check-label" htmlFor="q-steps2-checkbox4">记住邮箱地址</label>
                </div>
              </div>
              <p className="fs-12">这用于 Let's Encrypt 为你发送证书即将过期的邮件。</p>
            </div>
          </div>

          <p className="no-a">
            <a data-bs-toggle="collapse" href="#g">
              高级选项
            </a>
          </p>
          <div className="collapse" id="g">
            <div className="mt-3">

              <p>证书类型(私钥)</p>

              <input type="radio" name="q-privateKey" id="q-privateKey-auto" value="auto" className="d-none" defaultChecked />
              <label htmlFor="q-privateKey-auto" className="label-radio">自动</label>

              <input type="radio" name="q-privateKey" id="q-privateKey-ecc" value="ecc" className="d-none" />
              <label htmlFor="q-privateKey-ecc" className="label-radio">ECC<span className="fs-12"> 效率推荐</span></label>

              <input type="radio" name="q-privateKey" id="q-privateKey-rsa" value="rsa" className="d-none" />
              <label htmlFor="q-privateKey-rsa" className="label-radio">RSA<span className="fs-12"> 兼容性推荐</span></label>

              <input type="radio" name="q-privateKey" id="q-privateKey-user" value="rsa" className="d-none" />
              <label htmlFor="q-privateKey-user" className="label-radio">自定义</label>
              <div className="mt-2 mb-3">
                <textarea style={{ display: 'none' }} id="q-privateKey-userInput" className="form-control q-form fs-14"
                  rows="5" placeholder="输入证书私钥 ..."></textarea>
              </div>

              <p>ACME 账户私钥</p>
              <input type="radio" id="q-accountKey-auto" className="d-none" defaultChecked />
              <label htmlFor="q-accountKey-auto" className="label-radio">自动</label>

              <a href="../settings/" target="_blank" className="label-radio">
                <span>前往设置 </span>
                <span className="fs-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor"
                    className="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5" />
                    <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z" />
                  </svg>
                </span>
              </a>

            </div>
          </div>

          <div className="itemBox eabShow d-none">
            <div className="pd Bold"><span className="langCN">EAB 凭据：</span><span className="langEN"></span></div>
            <div className="pd">
              <span className="langCN">当前 ACME 服务要求提供外部账号绑定凭据 (ExternalAccount Binding)，比如 ZeroSSL ：你可以在 ZeroSSL 的管理控制台的 Developer 中获得此凭据，所以你需要先注册一个 ZeroSSL的账号。</span>
              <span className="langEN"></span>
            </div>
            <div className="FlexBox">
              <div><i className="must">*</i>EAB KID:</div>
              <div className="FlexItem"><input className="in_eab_kid inputLang" placeholder-cn="请填写EAB KID" placeholder-en="Please fill in EAB KID" /></div>
              <div><i className="must">*</i>HMAC KEY:</div>
              <div className="FlexItem"><input className="in_eab_key inputLang" placeholder-cn="请填写EAB HMAC KEY" placeholder-en="Please fill in EAB HMAC KEY" /></div>
            </div>
          </div>
          <div className="pd termsAgreeBox d-none">
            <label>
              <input type="checkbox" className="choice_termsAgree" defaultChecked />
              <span className="termsAgreeTips"></span>
            </label>
          </div>

          <div className="Center text-end mt-5">
            <button className="mainBtn btn q-btn step1-main-btn" onClick={() => { configStepClick(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-lightning-fill" viewBox="0 0 16 16">
                <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z" />
              </svg><span className="ms-2">继续 <em>Go!</em></span>
            </button>
            <div className="fs-12">
              <span>点击继续后代表你同意 </span>
              <a href="https://letsencrypt.org/documents/LE-SA-v1.4-April-3-2024.pdf" target="_blank" rel="nofollow noreferrer noopener">Let's Encrypt 使用条款</a> 。
              <p>来自 <a href="https://letsencrypt.org/" target="_blank">Let's Encrypt</a> 的 3 个月 TLS 证书。</p>
            </div>
          </div>

          <div className="configStepState fw-bold mt-2 fs-14"></div>

        </div>
      </div>



      <div id="q-steps3" style={{ display: 'none' }}>
        <h2 className="fw-light">最后一步，验证域名所有权</h2>
        <p className="mb-2">这是可信 CA 颁发证书所必需的阶段，您可能需要： <a href="/docs/#验证域名所有权" target="_blank">文档 - 验证域名所有权</a> 。</p>
        <div className="step3Hide step2Show step1Show">
          <div className="itemBox">
            <zsQ.Loading text="等待 ..." />
          </div>
        </div>
        <div className="step1Hide step2Hide step3Show">
          <div className="verifyBox"></div>
          <div className="itemBox">
            <div className="Center text-center">
              <span className="mainBtn verifyStepBtn btn q-btn fw-bold me-3" onClick={() => { verifyStepClick() }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cpu" viewBox="0 0 16 16">
                  <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0m-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z" />
                </svg><span className="ms-2 langCN">开始验证！</span>
              </span>
              <span className="mainBtn verifyRunStopBtn btn btn-red fw-bold me-3" onClick={() => { verifyRunStopClick() }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                </svg><span className="ms-2 langCN">取消 ...</span>
              </span>
              <button className="mainBtn btn btn-red fw-bold me-3" onClick={() => { configStepClick() }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                </svg><span className="ms-2">重试 ...</span>
              </button>
              <div className="alert alert-warning mt-3 fs-13" role="alert">
                <p>开始验证前请确保所有 DNS 记录或文件都已准备就绪，建议准备就绪后等待 30 秒后再点击。</p>
                <p>重试将刷新验证所需信息，需要重新设置 DNS 记录或文件。</p>
              </div>
            </div>
            <div className="verifyStepState fw-bold mt-2"></div>
          </div>
        </div>
      </div>



      <div id="q-steps4" style={{ display: 'none' }}>
        <div className="step4Hide step3Show step2Show step1Show">
          <div className="itemBox">
            <zsQ.Loading />
          </div>
        </div>
        <div className="step1Hide step2Hide step3Hide step4Show">

          <div className="row">
            <div className="col-12 mb-3">
              <h2 className="fw-light">结果输出</h2>
              <p className="mb-3 fs-14">证书的 PEM 和 KEY 已经保存到 <a href="/manage">证书管理</a> 。</p>
            </div>
            <div className="col-6 mb-4">
              <p className="fw-bold m-0">PEM</p>
              <textarea className="txt_downloadCert form-control q-form mb-2 fs-14" rows="5" readOnly></textarea>
              <a href="#!" className="mainBtn" onClick={() => { downloadBtnClick('Cert') }}>下载 .pem</a>
              <span className="mx-2">|</span>
              <a href="#!" id="x-q-copy-textpem">复制 PEM</a>
            </div>
            <div className="col-6 mb-4">
              <p className="fw-bold m-0">KEY</p>
              <textarea className="txt_downloadKey form-control q-form mb-2 fs-14" rows="5" readOnly></textarea>
              <a href="#!" className="mainBtn" onClick={() => { downloadBtnClick('Key') }}>下载 .key</a>
              <span className="mx-2">|</span>
              <a href="#!" id="x-q-copy-textkey">复制 KEY</a>
            </div>
            <div className="col-12 mt-5">
              <p className="text-center">
                <button onClick={() => { window.location.reload() }} className="btn q-btn fw-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                  </svg><span className="ms-2">再申请一张！</span>
                </button>
              </p>
            </div>
          </div>

          <div className="itemBox d-none">
            <div className="pd Bold"><i className="must">*</i><span className="langCN">保存记录 LOG 文件：</span></div>
            <div className="pd">
              <span className="langCN">建议下载保存此文件，本记录文件包含了所有数据，包括：证书 PEM 文本、证书私钥PEM文本、账户私钥 PEM 文本、所有配置参数。下次你需要续签新证书时，可以将本记录文件直接拖拽进本页面，会自动填写所有参数。</span>
            </div>
            <div className="FlexBox">
              <div className="FlexItem"><textarea className="txt_downloadLog" readOnly></textarea></div>
              <div>
                <div className="mainBtn" onClick={() => { downloadBtnClick('Log') }}>
                  <span className="langCN">下载保存</span>
                  <span className="langEN"></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SmallPage>
  </>)
};
