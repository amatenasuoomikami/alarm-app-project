import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Paper } from '@mui/material';
import { login, setAuthToken } from '../api/auth';

interface LoginFormProps {
    onLoginSuccess: () => void;
    onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            setAuthToken(response.access_token);
            onLoginSuccess();
        } catch (err) {
            setError('ログインに失敗しました');
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ padding: 3, marginTop: 8 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    ログイン
                </Typography>
                {error && (
                    <Typography color="error" gutterBottom>
                        {error}
                    </Typography>
                )}
                <form onSubmit={handleSubmit}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="ユーザー名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="パスワード"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                    >
                        ログイン
                    </Button>
                    <Button
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={onSwitchToRegister}
                    >
                        新規登録はこちら
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default LoginForm; 