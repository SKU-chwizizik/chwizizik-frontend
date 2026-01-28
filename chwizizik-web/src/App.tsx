import { useEffect, useState} from 'react';
import client from './api/client.ts';

function App() {
    const [serverData, setServerData] = useState<string>('서버와 대화 중...');

    useEffect(() => {
        // 백엔드의 HelloController (@GetMapping("/api/hello")) 호출
        client.get('/api/hello')
            .then((res: { data: string }) => setServerData(res.data))
            .catch((err : any) => {
                console.error(err);
                setServerData('연동 실패! 백엔드 서버가 켜져 있나요?');
            });
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            <h1>취지직 프로젝트 연동 테스트</h1>
            <div style={{ padding: '20px', border: '1px solid #646cff', borderRadius: '8px' }}>
                <p>백엔드로부터 온 메시지:</p>
                <h2 style={{ color: '#646cff' }}>{serverData}</h2>
            </div>
        </div>
    );
}

export default App;