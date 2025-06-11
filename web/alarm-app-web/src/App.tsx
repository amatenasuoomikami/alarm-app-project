import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Grid, Paper, ToggleButtonGroup, ToggleButton, Button, CircularProgress, Box } from '@mui/material';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { Calendar, momentLocalizer, Event as CalendarEvent, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PatternSettingsScreen from './components/patterns/PatternSettingsScreen';
import AlarmForm from './AlarmForm';
import BulkEditCalendar from './BulkEditCalendar';
import BulkEditForm from './BulkEditForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { fetchPatterns, Pattern as ApiPattern, PatternTime, deletePattern } from './api/patterns';
import { setAuthToken, logout, validateToken } from './api/auth';
import { createCalendarEvent, getCalendarEvents, deleteCalendarEvent } from './api/calendar';
import type { CalendarEvent as BackendCalendarEvent } from './api/calendar';

const localizer = momentLocalizer(moment);

interface CustomEvent extends CalendarEvent {
    patternId?: string;
    isAlarm?: boolean;
}

type AppMode = 'calendar' | 'bulkEdit' | 'patternSettings';

interface Alarm {
    date: string;
    time: string;
}

interface Pattern extends ApiPattern {
    dates?: string[];
}

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [alarms, setAlarms] = useState<Alarm[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [patterns, setPatterns] = useState<Pattern[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<BackendCalendarEvent[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [mode, setMode] = useState<AppMode>('calendar');
    const [patternsLoading, setPatternsLoading] = useState(false);
    const [patternsError, setPatternsError] = useState<string | null>(null);

    // 初回マウント時に保存されているトークンを確認
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            // トークンの有効性を確認
            validateToken()
                .then(isValid => {
                    setIsAuthenticated(isValid);
                })
                .catch(() => {
                    setIsAuthenticated(false);
                    logout();
                })
                .finally(() => {
                    setCheckingAuth(false);
                });
        } else {
            setIsAuthenticated(false);
            setCheckingAuth(false);
        }
    }, []);

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        setPatterns([]);
        setPatternsError(null);
        setPatternsLoading(false);
    };

    // カレンダーイベントを取得する関数
    const fetchCalendarEvents = async () => {
        try {
            const events = await getCalendarEvents();
            setCalendarEvents(events);

            // パターンのdatesを更新
            const eventsByPattern = events.reduce((acc, event) => {
                if (!acc[event.pattern_id]) {
                    acc[event.pattern_id] = [];
                }
                acc[event.pattern_id].push(event.date);
                return acc;
            }, {} as Record<string, string[]>);

            setPatterns(prevPatterns => 
                prevPatterns.map(pattern => ({
                    ...pattern,
                    dates: eventsByPattern[pattern.id] || []
                }))
            );
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        }
    };

    // 認証後にパターン一覧とカレンダーイベントを取得
    useEffect(() => {
        if (isAuthenticated) {
            setPatternsLoading(true);
            Promise.all([
                fetchPatterns(),
                getCalendarEvents()
            ])
                .then(([patternsData, eventsData]) => {
                    console.log('Fetched calendar events:', eventsData);
                    setCalendarEvents(eventsData);
                    
                    // パターンとカレンダーイベントを紐付け
                    const eventsByPattern = eventsData.reduce((acc, event) => {
                        if (!acc[event.pattern_id]) {
                            acc[event.pattern_id] = [];
                        }
                        acc[event.pattern_id].push(event.date);
                        return acc;
                    }, {} as Record<string, string[]>);

                    console.log('Fetched patterns:', patternsData);
                    setPatterns((patternsData.patterns || []).map(p => ({
                        ...p,
                        dates: eventsByPattern[p.id] || []
                    })));
                    setPatternsError(null);
                })
                .catch(e => {
                    console.error('Error fetching data:', e);
                    setPatternsError('データの取得に失敗しました');
                })
                .finally(() => setPatternsLoading(false));
        }
    }, [isAuthenticated]);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleRegisterSuccess = () => {
        setShowRegister(false);
        setIsAuthenticated(true);
    };

    const addAlarm = (newAlarm: Alarm) => {
        setAlarms(prevAlarms => [...prevAlarms, newAlarm]);
    };

    const setPattern = async (date: string, patternId: string) => {
        if (!date || !patternId) return;

        try {
            // 日付をYYYY-MM-DD形式に変換
            const formattedDate = moment(date).format('YYYY-MM-DD');
            
            // バックエンドにカレンダーイベントを保存
            await createCalendarEvent({
                pattern_id: patternId,
                date: formattedDate,
            });

            // カレンダーイベントを再取得して最新の状態に更新
            await fetchCalendarEvents();
        } catch (error) {
            console.error('Failed to save calendar event:', error);
        }
    };

    const handleSelectSlot = (slotInfo: { start: Date }) => {
        const selectedDate = moment(slotInfo.start).startOf('day').toDate();
        setSelectedDate(selectedDate);
    };

    const eventStyleGetter = (event: CustomEvent) => {
        if (event.isAlarm) {
            return {
                style: {
                    backgroundColor: '#ffa500',
                }
            };
        }
        const pattern = patterns.find(p => p.id === event.patternId);
        return {
            style: {
                backgroundColor: pattern ? pattern.color : '#3174ad',
            }
        };
    };

    const dayPropGetter = (date: Date) => {
        if (selectedDate && moment(date).isSame(selectedDate, 'day')) {
            return {
                style: {
                    backgroundColor: '#e6f7ff',
                    border: '1px solid #1890ff'
                }
            };
        }
        return {};
    };

    const events: CustomEvent[] = [
        ...calendarEvents.flatMap(event => {
            const pattern = patterns.find(p => p.id === event.pattern_id);
            console.log('Processing calendar event:', JSON.stringify(event, null, 2));
            console.log('Found pattern:', pattern ? JSON.stringify(pattern, null, 2) : 'Pattern not found');
            if (!pattern) return [];

            if (!pattern.times || pattern.times.length === 0) {
                console.warn('Pattern has no times:', pattern.id);
                return [];
            }

            return pattern.times.map(time => {
                console.log('Processing time:', JSON.stringify(time, null, 2));
                const [hours, minutes] = time.time.split(':');
                const eventDate = new Date(event.date);
                eventDate.setHours(parseInt(hours), parseInt(minutes));
                return {
                    start: eventDate,
                    end: eventDate,
                    title: `${pattern.name} - ${time.time}`,
                    patternId: pattern.id
                };
            });
        }),
        ...alarms.map(alarm => {
            const [year, month, day] = alarm.date.split('-');
            const [hours, minutes] = alarm.time.split(':');
            const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
            return {
                start: eventDate,
                end: eventDate,
                title: `Alarm - ${alarm.time}`,
                isAlarm: true
            };
        })
    ];

    const handleBulkApplyPattern = async (patternId: string) => {
        try {
            // 選択された各日付に対してパターンを適用
            await Promise.all(
                selectedDates.map(date => {
                    const formattedDate = moment(date).format('YYYY-MM-DD');
                    return createCalendarEvent({
                        pattern_id: patternId,
                        date: formattedDate,
                    });
                })
            );

            // カレンダーイベントを再取得して最新の状態に更新
            await fetchCalendarEvents();
            setSelectedDates([]);
        } catch (error) {
            console.error('Failed to apply pattern to dates:', error);
        }
    };

    const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: AppMode | null) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    // PatternSettingsScreenでパターン追加後にAPI再取得する関数
    const reloadPatterns = () => {
        setPatternsLoading(true);
        fetchPatterns()
            .then(data => {
                setPatterns((data.patterns || []).map(p => ({ ...p, dates: [] })));
                setPatternsError(null);
            })
            .catch(e => setPatternsError('パターン一覧の取得に失敗しました'))
            .finally(() => setPatternsLoading(false));
    };

    const handlePatternDelete = async (patternId: string) => {
        try {
            // パターンを削除
            await deletePattern(patternId);
            
            // 関連するカレンダーイベントを削除
            const eventsToDelete = calendarEvents.filter(event => event.pattern_id === patternId);
            await Promise.all(eventsToDelete.map(event => deleteCalendarEvent(event.id)));
            
            // ローカルの状態を更新
            setPatterns(prevPatterns => prevPatterns.filter(p => p.id !== patternId));
            setCalendarEvents(prevEvents => prevEvents.filter(e => e.pattern_id !== patternId));

            // パターン一覧を再読み込み
            reloadPatterns();
        } catch (error) {
            console.error('Failed to delete pattern and related events:', error);
        }
    };

    const handleSetPatterns = (newPatterns: Pattern[]) => {
        setPatterns(newPatterns);
    };

    const handleDeleteEvent = async (event: CustomEvent, deleteType: 'single' | 'future' | 'all') => {
        try {
            if (deleteType === 'single') {
                // 単一イベントの削除
                const eventToDelete = calendarEvents.find(e => 
                    e.pattern_id === event.patternId && 
                    e.date === moment(event.start).format('YYYY-MM-DD')
                );
                if (eventToDelete) {
                    await deleteCalendarEvent(eventToDelete.id);
                }
            } else if (deleteType === 'all') {
                // このパターンの全イベントを削除
                const eventsToDelete = calendarEvents.filter(e => e.pattern_id === event.patternId);
                await Promise.all(eventsToDelete.map(e => deleteCalendarEvent(e.id)));
            } else if (deleteType === 'future') {
                // この日以降のパターンイベントを削除
                const targetDate = moment(event.start).format('YYYY-MM-DD');
                const eventsToDelete = calendarEvents.filter(e => 
                    e.pattern_id === event.patternId && 
                    moment(e.date).isSameOrAfter(targetDate, 'day')
                );
                await Promise.all(eventsToDelete.map(e => deleteCalendarEvent(e.id)));
            }

            // カレンダーイベントを再取得して最新の状態に更新
            await fetchCalendarEvents();
        } catch (error) {
            console.error('Failed to delete calendar event:', error);
        }
    };

    if (checkingAuth) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        if (showRegister) {
            return (
                <RegisterForm
                    onRegisterSuccess={handleRegisterSuccess}
                    onSwitchToLogin={() => setShowRegister(false)}
                />
            );
        }
        return (
            <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setShowRegister(true)}
            />
        );
    }

    return (
        <div className="App">
            {/* パターン取得中やエラー表示 */}
            {patternsLoading && <Typography color="textSecondary">Loading patterns...</Typography>}
            {patternsError && <Typography color="error">{patternsError}</Typography>}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Alarm App
                    </Typography>
                    {isAuthenticated && (
                        <Button 
                            color="inherit" 
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                        >
                            ログアウト
                        </Button>
                    )}
                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="app mode"
                    >
                        <ToggleButton value="calendar" aria-label="calendar mode">
                            <CalendarViewMonthIcon />
                        </ToggleButton>
                        <ToggleButton value="bulkEdit" aria-label="bulk edit mode">
                            <EditIcon />
                        </ToggleButton>
                        <ToggleButton value="patternSettings" aria-label="pattern settings">
                            <AlarmOnIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ marginTop: '20px' }}>
                {mode === 'patternSettings' ? (
                    <PatternSettingsScreen 
                        patterns={patterns} 
                        setPatterns={handleSetPatterns} 
                        reloadPatterns={reloadPatterns}
                        onDeletePattern={handlePatternDelete}
                    />
                ) : mode === 'bulkEdit' ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ padding: '20px', height: '500px' }}>
                                <BulkEditCalendar
                                    events={events}
                                    onSelectDates={setSelectedDates}
                                    selectedDates={selectedDates}
                                    patterns={patterns}
                                    onDeleteEvent={handleDeleteEvent}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper sx={{ padding: '20px' }}>
                                <BulkEditForm
                                    selectedDates={selectedDates}
                                    patterns={patterns}
                                    onApplyPattern={handleBulkApplyPattern}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper sx={{ 
                                padding: '20px', 
                                height: '500px', // BulkEditCalendarと同じ高さ
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                {/* @ts-ignore */}
                                <Calendar
                                    localizer={localizer as any}
                                    events={events as any}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ flex: 1 }}
                                    selectable
                                    onSelectSlot={handleSelectSlot}
                                    eventPropGetter={eventStyleGetter}
                                    dayPropGetter={dayPropGetter}
                                    views={["month", "week", "day"]}
                                    defaultView="month"
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper sx={{ padding: '16px' }}>
                                <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'bold', mb: 2 }}>
                                    {selectedDate
                                        ? `${moment(selectedDate).format('YYYY年M月D日')} の設定`
                                        : 'カレンダーから日付を選択してください'}
                                </Typography>
                                <AlarmForm
                                    selectedDate={selectedDate}
                                    addAlarm={addAlarm}
                                    setPattern={setPattern}
                                    patterns={patterns}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </div>
    );
};

export default App;