import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Paper, Link } from '@mui/material';
import { register } from '../api/auth';

interface RegisterFormProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ username, email, password });
            onRegisterSuccess();
        } catch (err) {
            setError('ユーザー登録に失敗しました');
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ padding: 3, marginTop: 8 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    ユーザー登録
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
                        label="メールアドレス"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        登録
                    </Button>
                    <Button
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={onSwitchToLogin}
                    >
                        既にアカウントをお持ちの方はこちら
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default RegisterForm; 