// 공지사항 상세 페이지 컴포넌트
const AnnouncementDetail = () => {
    const [announcement, setAnnouncement] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        loadAnnouncement();
    }, []);

    const loadAnnouncement = async () => {
        try {
            setLoading(true);
            // URL에서 공지사항 ID 추출
            const urlParts = window.location.pathname.split('/');
            const announcementId = urlParts[urlParts.length - 1];
            
            const response = await fetch(`/api/products/announcements/${announcementId}/`);
            if (response.ok) {
                const data = await response.json();
                setAnnouncement(data);
                setError(null);
            } else {
                setError('공지사항을 찾을 수 없습니다.');
            }
        } catch (err) {
            console.error('공지사항 로드 실패:', err);
            setError('공지사항을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        if (window.Router) {
            window.Router.navigate('/');
        } else {
            window.location.href = '/';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'loading' }, '로딩 중...')
        );
    }

    if (error) {
        return React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'error' }, error),
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: handleBackClick,
                style: { marginTop: '20px' }
            }, '홈으로 돌아가기')
        );
    }

    if (!announcement) {
        return React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'error' }, '공지사항을 찾을 수 없습니다.')
        );
    }

    return React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'announcement-detail' },
            React.createElement('button', {
                className: 'btn btn-outline back-btn',
                onClick: handleBackClick
            }, '← 돌아가기'),
            
            React.createElement('div', { className: 'announcement-header' },
                React.createElement('h1', { className: 'announcement-title' }, announcement.title),
                React.createElement('div', { className: 'announcement-meta' },
                    React.createElement('span', { className: 'announcement-date' }, 
                        '작성일: ', formatDate(announcement.created_at)
                    ),
                    announcement.updated_at !== announcement.created_at && 
                    React.createElement('span', { className: 'announcement-updated' },
                        ' (수정일: ', formatDate(announcement.updated_at), ')'
                    )
                )
            ),
            
            React.createElement('div', { className: 'announcement-content' },
                announcement.content.split('\n').map((line, index) =>
                    React.createElement('p', { key: index }, line || React.createElement('br'))
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.AnnouncementDetail = AnnouncementDetail;
