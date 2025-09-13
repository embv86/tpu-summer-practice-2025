import React, {useState} from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import {Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider} from '@mui/material';
import {tableConfig} from '../tableConfig';
import TableView from './TableView';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import MouseIcon from '@mui/icons-material/Mouse';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

const WelcomePage = () => (
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: 'text.secondary'
    }}>
        <Typography variant="h3" gutterBottom>
            Добро пожаловать!
        </Typography>
        <Typography variant="h6" sx={{mb: 4}}>
            Это интерфейс для управления базой данных "Автосалон".
        </Typography>

        <Divider sx={{width: '50%', mb: 4}}/>

        <Typography variant="h5" gutterBottom>
            Как это работает:
        </Typography>
        <List sx={{maxWidth: 600, textAlign: 'left'}}>
            <ListItem>
                <ListItemIcon><MouseIcon color="primary"/></ListItemIcon>
                <ListItemText primary="Выберите таблицу в меню слева, чтобы просмотреть или изменить ее данные."/>
            </ListItem>
            <ListItem>
                <ListItemIcon><SearchIcon color="primary"/></ListItemIcon>
                <ListItemText primary="Используйте поле поиска над таблицей для быстрой фильтрации записей."/>
            </ListItem>
            <ListItem>
                <ListItemIcon><SortIcon color="primary"/></ListItemIcon>
                <ListItemText primary="Кликайте на заголовки колонок, чтобы отсортировать данные."/>
            </ListItem>
            <ListItem>
                <ListItemIcon><DoubleArrowIcon color="primary"/></ListItemIcon>
                <ListItemText
                    primary="Дважды кликните на связанный элемент (например, на название бренда в таблице моделей), чтобы мгновенно перейти к этой записи в соответствующей таблице."
                />
            </ListItem>
        </List>
    </Box>
);

function Layout() {
    const [selectedTable, setSelectedTable] = useState(null); // Было: useState('instances')

    const handleGoHome = () => {
        setSelectedTable(null);
        setHighlightedRow(null);
    };

    const [highlightedRow, setHighlightedRow] = useState(null);

    const handleSelectTable = (tableName) => {
        setSelectedTable(tableName);
        setHighlightedRow(null);
    };

    const handleNavigate = (targetTable, targetId) => {
        setSelectedTable(targetTable);
        setHighlightedRow({tableName: targetTable, id: targetId});
    };

    const clearHighlight = () => {
        setHighlightedRow(null);
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <Header onTitleClick={handleGoHome}/>
            <Box sx={{display: 'flex', flexGrow: 1, overflow: 'hidden', p: 2, gap: 2}}>
                <Sidebar onSelectTable={handleSelectTable}/>

                <Paper component="main" sx={{flexGrow: 1, p: 3, overflow: 'auto'}} elevation={2}>
                    {selectedTable ? (
                        <>
                            <Typography variant="h4" gutterBottom>
                                {tableConfig[selectedTable]?.displayName}
                            </Typography>

                            <TableView
                                key={selectedTable}
                                tableName={selectedTable}
                                onNavigate={handleNavigate}
                                onClearHighlight={clearHighlight}
                                highlightedRowId={
                                    highlightedRow?.tableName === selectedTable ? highlightedRow.id : null
                                }
                            />
                        </>
                    ) : (
                        <WelcomePage/>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}

export default Layout;