import { useEffect } from 'react';
import Head from 'next/head';
import { zsQ, SmallPage, dTitle } from '@components/main';

export default () => {

    useEffect(() => {

        const getMsg = zsQ.getQuery('q') || null;
        const msgDiv = document.getElementById('msg');

        const msgMap = {
            'no-https': '正在使用非 https:// 的不安全协议访问，无法启用 Crypto 。',
            'browser-old-version': '您的浏览器版本过低，请更新浏览器或使用推荐的 Google® Chrome 。',
            'no-crypto': '您的浏览器不支持 Web Cryptography API ，请更新浏览器或使用推荐的 Google® Chrome 。',
        };

        if (msgMap[getMsg]) {
            msgDiv.innerHTML = msgMap[getMsg];
        } else {
            msgDiv.innerHTML = `未知错误：<code>${getMsg}</code>`;
        };

    }, []);

    return (<>
        <Head>
            <title>{`出现错误 - ${dTitle}`}</title>
        </Head>
        <SmallPage name="出现错误">
            <div id='type'></div>
            <div id='msg' className='mt-4'></div>
        </SmallPage>
    </>)
}
