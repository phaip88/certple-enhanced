import Head from "next/head";
import { useState, useEffect } from "react";
import { tc, dTitle, SmallPage } from '@components/main';
import { CredentialManager } from '../../lib/auth/index.js';
import { TelegramNotifier } from '../../lib/auto-renewal/index.js';

export default () => {
    const [activeTab, setActiveTab] = useState('data');
    const [credentialManager] = useState(() => new CredentialManager());
    const [telegramNotifier] = useState(() => new TelegramNotifier());
    
    // 认证设置状态
    const [hasCredentials, setHasCredentials] = useState(false);
    const [authForm, setAuthForm] = useState({
        username: '',
        password: '',
        oldPassword: '',
        newUsername: '',
        newPassword: ''
    });
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');

    // Telegram 通知设置状态
    const [telegramConfig, setTelegramConfig] = useState({
        enabled: false,
        botToken: '',
        chatId: '',
        notifyOnExpiring: true,
        notifyOnRenewalSuccess: true,
        notifyOnRenewalFailure: true
    });
    const [telegramError, setTelegramError] = useState('');
    const [telegramSuccess, setTelegramSuccess] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        // 检查是否已设置凭证
        setHasCredentials(credentialManager.hasCredentials());

        // 加载 Telegram 配置
        const tgConfig = telegramNotifier.getTelegramConfig();
        setTelegramConfig(tgConfig);

        // 数据管理相关的事件监听
        const userDomain = localStorage.getItem('x-q-domain');
        const userDomainInput = document.getElementById("userDomain");
        if (userDomain && userDomainInput) {
            userDomainInput.value = userDomain;
        };
        if (userDomainInput) {
            userDomainInput.addEventListener("input", () => {
                localStorage.setItem("x-q-domain", userDomainInput.value);
            });
        }

        const userEmail = localStorage.getItem('x-q-email');
        const userEmailInput = document.getElementById("userEmail");
        if (userEmail && userEmailInput) {
            userEmailInput.value = userEmail;
        };
        if (userEmailInput) {
            userEmailInput.addEventListener("input", () => {
                localStorage.setItem("x-q-email", userEmailInput.value);
            });
        }

        const acmeAccountKey = localStorage.getItem('q-acmeAccountKey');
        const acmeAccountKeyInput = document.getElementById("acmeAccountKey");
        if (acmeAccountKey && acmeAccountKeyInput) {
            acmeAccountKeyInput.value = acmeAccountKey;
        };
        if (acmeAccountKeyInput) {
            acmeAccountKeyInput.addEventListener("input", () => {
                localStorage.setItem("q-acmeAccountKey", acmeAccountKeyInput.value);
            });
        }

        const manageDataPairs = localStorage.getItem('q-manageDataPairs');
        const manageDataPairsInput = document.getElementById("manageDataPairs");
        if (manageDataPairs && manageDataPairsInput) {
            manageDataPairsInput.value = manageDataPairs;
        };
        if (manageDataPairsInput) {
            manageDataPairsInput.addEventListener("input", () => {
                localStorage.setItem("q-manageDataPairs", manageDataPairsInput.value);
            });
        }

        const domainArray = localStorage.getItem('q-domainArray');
        const domainArrayInput = document.getElementById("domainArray");
        if (domainArray && domainArrayInput) {
            domainArrayInput.value = domainArray;
        };
        if (domainArrayInput) {
            domainArrayInput.addEventListener("input", () => {
                localStorage.setItem("q-domainArray", domainArrayInput.value);
            });
        }

        const outBtn = document.getElementById("outLocalStorage");
        if (outBtn) {
            outBtn.addEventListener("click", () => {
                const data = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (['x-q-domain', 'x-q-email', 'q-acmeAccountKey', 'q-manageDataPairs', 'q-domainArray'].includes(key)) {
                        data[key] = localStorage.getItem(key);
                    }
                };
                const a = document.createElement('a');
                a.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
                a.setAttribute('download', 'Certple_Data.json');
                a.click();
            });
        }

        const inBtn = document.getElementById("inLocalStorage");
        if (inBtn) {
            inBtn.addEventListener("click", () => {
                const i = document.createElement('input');
                i.type = 'file';
                i.accept = '.json';
                i.style.display = 'none';
                i.addEventListener('change', (event) => {
                    const file = new FileReader();
                    file.onload = (event) => {
                        try {
                            const data = JSON.parse(event.target.result);
                            for (const key in data) {
                                if (data.hasOwnProperty(key)) {
                                    localStorage.setItem(key, data[key]);
                                }
                            }
                            tc('数据导入成功~');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } catch (error) {
                            tc('数据导入失败 ...' + error);
                        };
                    };
                    file.readAsText(event.target.files[0]);
                });
                document.body.appendChild(i);
                i.click();
                i.addEventListener('change', () => {
                    document.body.removeChild(i);
                });
            });
        }

        const clearBtn = document.getElementById('clearStorage');
        if (clearBtn) {
            clearBtn.addEventListener('click', function (event) {
                event.preventDefault();
                const i = confirm('清空数据可能会解决 Certple 无法正常工作的问题，但是会清空所有数据导致已验证的域名需要重新验证(除非您保存了 ACME 账户私钥)，确定要清空数据吗？');
                if (i) {
                    localStorage.clear();
                    tc('已完成清除 ... 将在 5 秒后返回首页 ...', 5000);
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 5000);
                };
            });
        }
    }, []);

    // 处理创建凭证
    const handleCreateCredentials = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        const result = await credentialManager.setCredentials(
            authForm.username,
            authForm.password
        );

        if (result.success) {
            setAuthSuccess('凭证创建成功！');
            setHasCredentials(true);
            setAuthForm({ ...authForm, username: '', password: '' });
            tc('凭证创建成功！');
        } else {
            setAuthError(result.error);
        }
    };

    // 处理更新凭证
    const handleUpdateCredentials = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        const result = await credentialManager.updateCredentials(
            authForm.oldPassword,
            authForm.newUsername,
            authForm.newPassword
        );

        if (result.success) {
            setAuthSuccess('凭证更新成功！');
            setAuthForm({ ...authForm, oldPassword: '', newUsername: '', newPassword: '' });
            tc('凭证更新成功！');
        } else {
            setAuthError(result.error);
        }
    };

    // 处理 Telegram 配置保存
    const handleSaveTelegramConfig = (e) => {
        e.preventDefault();
        setTelegramError('');
        setTelegramSuccess('');

        const success = telegramNotifier.saveTelegramConfig(telegramConfig);

        if (success) {
            setTelegramSuccess('Telegram 通知配置已保存！');
            tc('Telegram 通知配置已保存！');
        } else {
            setTelegramError('保存失败，请检查配置');
        }
    };

    // 测试 Telegram 连接
    const handleTestTelegram = async () => {
        setIsTesting(true);
        setTelegramError('');
        setTelegramSuccess('');

        // 临时保存配置以便测试
        telegramNotifier.saveTelegramConfig(telegramConfig);

        const success = await telegramNotifier.testConnection();

        if (success) {
            setTelegramSuccess('测试消息发送成功！请检查 Telegram');
            tc('测试消息发送成功！');
        } else {
            setTelegramError('测试失败，请检查 Bot Token 和 Chat ID');
        }

        setIsTesting(false);
    };

    return (<>
        <Head>
            <title>{`设置 - ${dTitle}`}</title>
        </Head>
        <SmallPage name="设置">
            {/* 选项卡导航 */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <a 
                        className={`nav-link ${activeTab === 'data' ? 'active' : ''}`}
                        href="#!"
                        onClick={(e) => { e.preventDefault(); setActiveTab('data'); }}
                    >
                        数据管理
                    </a>
                </li>
                <li className="nav-item">
                    <a 
                        className={`nav-link ${activeTab === 'auth' ? 'active' : ''}`}
                        href="#!"
                        onClick={(e) => { e.preventDefault(); setActiveTab('auth'); }}
                    >
                        认证设置
                    </a>
                </li>
                <li className="nav-item">
                    <a 
                        className={`nav-link ${activeTab === 'telegram' ? 'active' : ''}`}
                        href="#!"
                        onClick={(e) => { e.preventDefault(); setActiveTab('telegram'); }}
                    >
                        Telegram 通知
                    </a>
                </li>
            </ul>

            {/* 数据管理选项卡 */}
            {activeTab === 'data' && (
                <>
                    <div className="mb-5">
                        <p className="mb-3">一切数据在本地存储，位于 localStorage ，如果不明白这些是什么，应该不要碰它们。</p>
                        <div>
                            <button id="outLocalStorage" className="btn q-btn me-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                                </svg><span className="ms-2">导出数据</span>
                            </button>
                            <button id="inLocalStorage" className="btn q-btn me-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                                </svg><span className="ms-2">导入数据</span>
                            </button>
                            <button id="clearStorage" className="btn q-btn me-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                </svg><span className="ms-2">清空数据</span>
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p>域名 [String]</p>
                        <textarea className="form-control q-form" rows="1" id="userDomain" placeholder="..."></textarea>
                    </div>
                    <div className="mb-4">
                        <p>电子邮箱地址 [String]</p>
                        <textarea className="form-control q-form" rows="1" id="userEmail" placeholder="..."></textarea>
                    </div>
                    <div className="mb-4">
                        <p>高级 - ACME 账户私钥 [String]</p>
                        <textarea className="form-control q-form fs-14" rows="5" id="acmeAccountKey" placeholder="..."></textarea>
                    </div>
                    <div className="mb-4">
                        <p>高级 - 历史域名记忆 [Array]</p>
                        <textarea className="form-control q-form fs-14" rows="5" id="domainArray" placeholder="..."></textarea>
                    </div>
                    <div className="mb-4">
                        <p>高级 - 保存的证书 [JSON]</p>
                        <textarea className="form-control q-form fs-13" rows="5" id="manageDataPairs" placeholder="..."></textarea>
                    </div>
                </>
            )}

            {/* 认证设置选项卡 */}
            {activeTab === 'auth' && (
                <>
                    <div className="mb-4">
                        <p className="mb-3">设置用户名和密码以保护您的证书管理页面。</p>
                    </div>

                    {authError && (
                        <div className="alert alert-danger" role="alert">
                            {authError}
                        </div>
                    )}

                    {authSuccess && (
                        <div className="alert alert-success" role="alert">
                            {authSuccess}
                        </div>
                    )}

                    {!hasCredentials ? (
                        // 创建凭证表单
                        <form onSubmit={handleCreateCredentials}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">用户名</label>
                                <input
                                    type="text"
                                    className="form-control q-form"
                                    id="username"
                                    value={authForm.username}
                                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                                    placeholder="3-20 个字符"
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                                <small className="form-text text-muted">用户名长度为 3-20 个字符</small>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">密码</label>
                                <input
                                    type="password"
                                    className="form-control q-form"
                                    id="password"
                                    value={authForm.password}
                                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                                    placeholder="至少 6 个字符"
                                    required
                                    minLength={6}
                                />
                                <small className="form-text text-muted">密码至少 6 个字符</small>
                            </div>

                            <button type="submit" className="btn q-btn">
                                创建凭证
                            </button>
                        </form>
                    ) : (
                        // 更新凭证表单
                        <form onSubmit={handleUpdateCredentials}>
                            <div className="alert alert-info" role="alert">
                                您已设置凭证。如需修改，请输入旧密码和新的用户名/密码。
                            </div>

                            <div className="mb-3">
                                <label htmlFor="oldPassword" className="form-label">旧密码</label>
                                <input
                                    type="password"
                                    className="form-control q-form"
                                    id="oldPassword"
                                    value={authForm.oldPassword}
                                    onChange={(e) => setAuthForm({ ...authForm, oldPassword: e.target.value })}
                                    placeholder="请输入旧密码"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="newUsername" className="form-label">新用户名</label>
                                <input
                                    type="text"
                                    className="form-control q-form"
                                    id="newUsername"
                                    value={authForm.newUsername}
                                    onChange={(e) => setAuthForm({ ...authForm, newUsername: e.target.value })}
                                    placeholder="3-20 个字符"
                                    required
                                    minLength={3}
                                    maxLength={20}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="newPassword" className="form-label">新密码</label>
                                <input
                                    type="password"
                                    className="form-control q-form"
                                    id="newPassword"
                                    value={authForm.newPassword}
                                    onChange={(e) => setAuthForm({ ...authForm, newPassword: e.target.value })}
                                    placeholder="至少 6 个字符"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button type="submit" className="btn q-btn">
                                更新凭证
                            </button>
                        </form>
                    )}
                </>
            )}

            {/* Telegram 通知选项卡 */}
            {activeTab === 'telegram' && (
                <>
                    <div className="mb-4">
                        <p className="mb-3">配置 Telegram Bot 以接收证书到期和续期通知。</p>
                        <div className="alert alert-info" role="alert">
                            <strong>如何获取配置信息：</strong>
                            <ol className="mb-0 mt-2">
                                <li>在 Telegram 中搜索 <code>@BotFather</code> 并创建一个新的 Bot</li>
                                <li>复制 Bot Token 并粘贴到下方</li>
                                <li>在 Telegram 中搜索 <code>@userinfobot</code> 获取你的 Chat ID</li>
                                <li>或者创建一个群组，将 Bot 添加进去，使用群组的 Chat ID</li>
                            </ol>
                        </div>
                    </div>

                    {telegramError && (
                        <div className="alert alert-danger" role="alert">
                            {telegramError}
                        </div>
                    )}

                    {telegramSuccess && (
                        <div className="alert alert-success" role="alert">
                            {telegramSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSaveTelegramConfig}>
                        <div className="mb-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="telegramEnabled"
                                    checked={telegramConfig.enabled}
                                    onChange={(e) => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="telegramEnabled">
                                    启用 Telegram 通知
                                </label>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="botToken" className="form-label">Bot Token</label>
                            <input
                                type="text"
                                className="form-control q-form"
                                id="botToken"
                                value={telegramConfig.botToken}
                                onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                required={telegramConfig.enabled}
                            />
                            <small className="form-text text-muted">从 @BotFather 获取的 Bot Token</small>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="chatId" className="form-label">Chat ID</label>
                            <input
                                type="text"
                                className="form-control q-form"
                                id="chatId"
                                value={telegramConfig.chatId}
                                onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                                placeholder="123456789 或 -100123456789"
                                required={telegramConfig.enabled}
                            />
                            <small className="form-text text-muted">你的用户 ID 或群组 ID（群组 ID 以 - 开头）</small>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">通知类型</label>
                            
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="notifyExpiring"
                                    checked={telegramConfig.notifyOnExpiring}
                                    onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyOnExpiring: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="notifyExpiring">
                                    证书即将到期提醒
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="notifySuccess"
                                    checked={telegramConfig.notifyOnRenewalSuccess}
                                    onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyOnRenewalSuccess: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="notifySuccess">
                                    续期成功通知
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="notifyFailure"
                                    checked={telegramConfig.notifyOnRenewalFailure}
                                    onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyOnRenewalFailure: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="notifyFailure">
                                    续期失败通知
                                </label>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn q-btn">
                                保存配置
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={handleTestTelegram}
                                disabled={isTesting || !telegramConfig.botToken || !telegramConfig.chatId}
                            >
                                {isTesting ? '发送中...' : '发送测试消息'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </SmallPage>
    </>)
};
