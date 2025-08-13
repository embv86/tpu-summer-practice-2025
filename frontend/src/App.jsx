import Layout from './components/Layout';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        primary: {
            main: '#ff5f1f',
        },
        secondary: {
            main: '#ef5350',
        },
    },
    shape: {
        borderRadius: 8,
    },

    typography: {
        fontFamily: 'Inter, sans-serif',
    },
});


function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="App">
                <Layout />
            </div>
        </ThemeProvider>
    );
}

export default App;