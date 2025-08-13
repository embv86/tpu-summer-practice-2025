import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material'; // Импортируем Box

// --- 👇 ПРИНИМАЕМ onTitleClick КАК ПРОПС 👇 ---
function Header({ onTitleClick }) {
    return (
        <AppBar position="static">
            <Toolbar>
                {/* --- 👇 ДЕЛАЕМ ЗАГОЛОВОК КЛИКАБЕЛЬНЫМ 👇 --- */}
                <Box
                    onClick={onTitleClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer', // Меняем курсор на "руку" при наведении
                        flexGrow: 1
                    }}
                >
                    <Typography variant="h6" component="div">
                        Управление Базой Данных Автосалона
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;