import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { SmallPage, dTitle, tc } from '@components/main';
import { CredentialManager, SessionManager } from '../lib/auth/index.js';

export default () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const credentialManager = new CredentialManager();
  const sessionManager = new SessionManager();

  // Check if already logged in
  useEffect(() => {
    if (sessionManager.isLoggedIn()) {
      const redirect = router.query.redirect || '/manage';
      router.push(redirect);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify credentials
      const isValid = await credentialManager.verifyCredentials(username, password);
      
      if (isValid) {
        // Create session
        sessionManager.createSession(username);
        
        // Show success message
        tc('登录成功！', 1000);
        
        // Redirect to target page or manage page
        setTimeout(() => {
          const redirect = router.query.redirect || '/manage';
          router.push(redirect);
        }, 1000);
      } else {
        setError('用户名或密码错误');
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (<>
    <Head>
      <title>{`登录 - ${dTitle}`}</title>
    </Head>
    <SmallPage name="登录">
      <div className="mb-4">
        <p className="mb-3">请输入您的用户名和密码以访问证书管理功能。</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">用户名</label>
          <input
            type="text"
            className="form-control q-form"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            required
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">密码</label>
          <input
            type="password"
            className="form-control q-form"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3">
          <button 
            type="submit" 
            className="btn q-btn w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <p className="text-muted fs-14">
          首次使用？请前往 <a href="/settings">设置页面</a> 创建账户
        </p>
      </div>
    </SmallPage>
  </>);
};
