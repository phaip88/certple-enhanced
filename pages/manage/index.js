import { useEffect, useState } from 'react';
import Head from 'next/head';
import { dTitle, tc } from '@components/main';
import { CertificateScanner, ConfigManager, HistoryManager } from '../../lib/auto-renewal/index.js';

export default () => {
    const [certificates, setCertificates] = useState([]);
    const [renewalConfig, setRenewalConfig] = useState({});
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [renewalHistory, setRenewalHistory] = useState([]);
    
    const scanner = new CertificateScanner();
    const configManager = new ConfigManager();
    const historyManager = new HistoryManager();

    useEffect(() => {
        // 加载配置
        const config = configManager.getAutoRenewalConfig();
        setRenewalConfig(config);
        
        // 扫描证书
        const scannedCerts = scanner.scanCertificates();
        setCertificates(scannedCerts);

        const dataDiv = document.getElementById('dataDiv');

        const data = JSON.parse(localStorage.getItem('q-manageDataPairs')) || [];
        const notFound = '未知';

        if (data.length != 0) {
            dataDiv.innerHTML = "";
            data.forEach((d, i) => {
                const pem = d.cert || notFound;
                const key = d.key || notFound;
                const domain = d.domains || notFound;
                const index = i + 1;
                
                // 获取续期状态
                const certInfo = scannedCerts.find(c => c.domains === domain);
                const daysUntilExpiry = certInfo ? certInfo.daysUntilExpiry : null;
                const isExpired = certInfo ? certInfo.isExpired : false;
                const renewalStatus = d.renewalStatus || 'idle';
                const isAutoRenewalEnabled = configManager.isCertAutoRenewalEnabled(domain);
                
                // 状态指示器
                let statusBadge = '';
                if (isExpired) {
                    statusBadge = '<span class="badge bg-danger">已过期</span>';
                } else if (renewalStatus === 'in_progress') {
                    statusBadge = '<span class="badge bg-info">续期中</span>';
                } else if (renewalStatus === 'success') {
                    statusBadge = '<span class="badge bg-success">续期成功</span>';
                } else if (renewalStatus === 'failure') {
                    statusBadge = '<span class="badge bg-warning">续期失败</span>';
                } else if (renewalStatus === 'pending') {
                    statusBadge = '<span class="badge bg-secondary">待续期</span>';
                } else if (daysUntilExpiry !== null && daysUntilExpiry <= renewalConfig.threshold) {
                    statusBadge = '<span class="badge bg-warning">即将到期</span>';
                }

                const item = `
                    <tr>
                        <td># ${index}</td>
                        <td>
                            ${domain}
                            ${statusBadge}
                            ${isAutoRenewalEnabled ? '<span class="badge bg-primary ms-1">自动续期</span>' : ''}
                        </td>
                        <td class="guoqi-time" data-time="${d.time}"></td>
                        <td>
                            <a href="#!" class="downPem" data-id="${index}">下载 .pem</a>
                            <span> | </span>
                            <a href="#!" class="downKey" data-id="${index}">下载 .key</a>
                            <span> | </span>
                            <a href="#!" class="delete" data-id="${i}">删除</a>
                            <span> | </span>
                            <a href="#!" class="update" data-id="${index}">续期</a>
                            <span> | </span>
                            <a href="#!" class="toggle-auto-renewal" data-domain="${domain}" data-enabled="${isAutoRenewalEnabled}">${isAutoRenewalEnabled ? '禁用' : '启用'}自动续期</a>
                            <span> | </span>
                            <a href="#!" class="view-history" data-domain="${domain}">查看历史</a>
                            <span> | </span>
                            <a href="#!" data-id="${index}" data-bs-toggle="collapse" data-bs-target="#td-collapse-${index}" aria-expanded="false" aria-controls="td-collapse-${index}">显示源字符串</a>
                            <div class="collapse" id="td-collapse-${index}">
                                <div class="pt-4">
                                    <div class="mb-3">
                                        <label>证书内容 (PEM)</label>
                                        <textarea class="form-control" rows="4">${pem}</textarea>
                                    </div>
                                    <label>私钥内容 (KEY)</label>
                                    <textarea class="form-control" rows="4">${key}</textarea>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <pre id="td-pem-${index}" class="d-none">${pem}</pre>
                    <pre id="td-key-${index}" class="d-none">${key}</pre>
                    <pre id="td-domain-${index}" class="d-none">${domain}</pre>
                `;
                dataDiv.innerHTML += item;
            });
            
            // 添加自动续期开关事件监听
            const toggleLinks = document.querySelectorAll('.toggle-auto-renewal');
            toggleLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const domain = this.getAttribute('data-domain');
                    const currentEnabled = this.getAttribute('data-enabled') === 'true';
                    configManager.setCertAutoRenewal(domain, !currentEnabled);
                    tc(`已${!currentEnabled ? '启用' : '禁用'}自动续期`);
                    setTimeout(() => window.location.reload(), 1000);
                });
            });
            
            // 添加查看历史事件监听
            const historyLinks = document.querySelectorAll('.view-history');
            historyLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const domain = this.getAttribute('data-domain');
                    setSelectedDomain(domain);
                    const history = historyManager.getHistory(domain);
                    setRenewalHistory(history);
                    setShowHistoryModal(true);
                });
            });
        } else {
            document.querySelector('.q-table').innerHTML = "<p>您还没有申请任何一个证书，请前往 <a href='/'>申请证书</a> 页面开始 ~</p>";
        };



        const guoqiTimes = document.querySelectorAll('.guoqi-time');
        function updateGuoqiTimes() {
            guoqiTimes.forEach(i => {
                const now = new Date();
                let time = (new Date((new Date(i.getAttribute('data-time'))).getTime() + 90 * 24 * 60 * 60 * 1000)) - now;
                if (time < 0 || time === 0) {
                    i.textContent = '已过期';
                } else {
                    const days = Math.floor(time / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
                    const timeOut = `${days} 天 ${hours} 小时 ${minutes} 分`;
                    i.textContent = timeOut;
                };
            });
        }
        setInterval(updateGuoqiTimes, 60000);
        updateGuoqiTimes();



        const downPemA = document.querySelectorAll('a.downPem');
        downPemA.forEach(function (i) {
            i.addEventListener('click', function (event) {
                event.preventDefault();
                const dataId = this.getAttribute('data-id');
                const pemPre = document.getElementById('td-pem-' + dataId);
                const domainPre = document.getElementById('td-domain-' + dataId);

                const domains = domainPre.textContent || domainPre.innerText;
                const pem = pemPre.textContent || pemPre.innerText;
                const blob = new Blob([pem], { type: 'application/x-pem-file' });
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = 'Certple_' + domains + '.pem';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                window.URL.revokeObjectURL(downloadLink.href);
            });
        });

        const downKeyA = document.querySelectorAll('a.downKey');
        downKeyA.forEach(function (i) {
            i.addEventListener('click', function (event) {
                event.preventDefault();
                const dataId = this.getAttribute('data-id');
                const keyPre = document.getElementById('td-key-' + dataId);
                const domainPre = document.getElementById('td-domain-' + dataId);

                const domains = domainPre.textContent || domainPre.innerText;
                const pem = keyPre.textContent || keyPre.innerText;
                const blob = new Blob([pem], { type: 'application/x-key-file' });
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = 'Certple_' + domains + '.key';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                window.URL.revokeObjectURL(downloadLink.href);
            });
        });

        const deleteLinks = document.querySelectorAll('.delete');
        deleteLinks.forEach(i => {
            i.addEventListener('click', function (event) {
                event.preventDefault();
                const dataIndex = this.getAttribute('data-id');
                if (confirm('您确定要删除吗？此操作将不可逆 ...')) {
                    data.splice(dataIndex, 1);
                    localStorage.setItem('q-manageDataPairs', JSON.stringify(data));
                    tc('正在删除 ...', 1000);
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                };
            });
        });

        const updateLinks = document.querySelectorAll('.update');
        updateLinks.forEach(i => {
            i.addEventListener('click', function (event) {
                event.preventDefault();
                const dataIndex = this.getAttribute('data-id');
                const domainPre = document.getElementById('td-domain-' + dataIndex);

                const domains = domainPre.textContent || domainPre.innerText;
                window.location.href = `/?domain=${domains}&type=0`;
            });
        });

    }, []);
    
    // 关闭历史记录模态框
    const closeHistoryModal = () => {
        setShowHistoryModal(false);
        setSelectedDomain('');
        setRenewalHistory([]);
    };
    
    // 格式化时间戳
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '未知';
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    };

    return (<>

        <Head>
            <title>{`证书管理 - ${dTitle}`}</title>
        </Head>
        <h1 className='fw-bold mb-4'>证书管理</h1>
        <div className='q-table'>
            <table>
                <thead>
                    <tr>
                        <td>序号</td>
                        <td>覆盖域名</td>
                        <td>预计到期时间</td>
                        <td>操作</td>
                    </tr>
                </thead>
                <tbody id="dataDiv"></tbody>
            </table>
        </div>
        
        {/* 续期历史模态框 */}
        {showHistoryModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">续期历史 - {selectedDomain}</h5>
                            <button type="button" className="btn-close" onClick={closeHistoryModal}></button>
                        </div>
                        <div className="modal-body">
                            {renewalHistory.length === 0 ? (
                                <p className="text-muted">暂无续期历史记录</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>时间</th>
                                                <th>状态</th>
                                                <th>详情</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {renewalHistory.map((record, idx) => (
                                                <tr key={idx}>
                                                    <td>{formatTimestamp(record.timestamp)}</td>
                                                    <td>
                                                        {record.status === 'success' && <span className="badge bg-success">成功</span>}
                                                        {record.status === 'failure' && <span className="badge bg-danger">失败</span>}
                                                        {record.status === 'in_progress' && <span className="badge bg-info">进行中</span>}
                                                    </td>
                                                    <td>
                                                        {record.error ? (
                                                            <span className="text-danger">{record.error}</span>
                                                        ) : (
                                                            <span className="text-success">续期成功</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeHistoryModal}>关闭</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

    </>)
};
