import React, {useState, useEffect, useRef, useMemo} from 'react';
import {apiService} from '../services/apiService';
import {tableConfig} from '../tableConfig';
import {
    Box, CircularProgress, Alert, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip, Button,
    alpha, TextField, InputAdornment, TableSortLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationDialog from './ConfirmationDialog';
import FormDialog from './FormDialog';

function TableView({tableName, onNavigate, highlightedRowId, onClearHighlight}) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lookupData, setLookupData] = useState({});
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');
    const [filterQuery, setFilterQuery] = useState('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const highlightedRowRef = useRef(null);
    const currentTableConfig = tableConfig[tableName];

    const getDisplayValueForRow = (column, row) => {
        const cellValue = row[column.key];
        if (column.isForeignKey && column.references) {
            const relatedData = lookupData[column.references];
            const relatedConfig = tableConfig[column.references];
            if (!relatedConfig || !relatedData) return String(cellValue);

            const relatedItem = relatedData.find(item => item[relatedConfig.primaryKey] === cellValue);
            if (relatedItem) {
                const displayConf = relatedConfig.displayColumn;
                return typeof displayConf === 'function'
                    ? displayConf(relatedItem)
                    : (relatedItem[displayConf] || String(cellValue));
            }
        }
        return String(cellValue);
    };

    useEffect(() => {
        setOrderBy('');
        setOrder('asc');
    }, [tableName]);

    const fetchData = async (showLoading = true) => {
        if (!currentTableConfig) {
            setError(`Конфигурация для таблицы "${tableName}" не найдена.`);
            return;
        }
        if (showLoading) setIsLoading(true);
        setError(null);
        try {
            const mainDataPromise = apiService.getAll(tableName);
            const foreignKeyColumns = currentTableConfig.columns.filter(col => col.isForeignKey && col.references);
            const uniqueReferences = [...new Set(foreignKeyColumns.map(col => col.references))];
            const foreignKeyLookups = uniqueReferences.map(ref => apiService.getAll(ref).then(res => ({
                name: ref,
                data: res.data
            })));
            const [mainResponse, ...lookupResponses] = await Promise.all([mainDataPromise, ...foreignKeyLookups]);
            setData(mainResponse.data);
            const lookups = lookupResponses.reduce((acc, result) => {
                acc[result.name] = result.data;
                return acc;
            }, {});
            setLookupData(lookups);
        } catch (err) {
            console.error(`Ошибка при загрузке данных для ${tableName}:`, err);
            setError(`Не удалось загрузить данные. Ошибка: ${err.message}`);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tableName]);
    useEffect(() => {
        if (highlightedRowId && highlightedRowRef.current) {
            highlightedRowRef.current.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }, [highlightedRowId, data]);

    const handleSortRequest = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const renderCellContent = (column, row) => {
        const cellValue = row[column.key];
        if (column.isForeignKey && column.references) {
            const relatedData = lookupData[column.references];
            const relatedConfig = tableConfig[column.references];
            if (!relatedConfig) return cellValue;
            const relatedItem = relatedData?.find(item => item[relatedConfig.primaryKey] === cellValue);
            let displayName = `${cellValue}`;
            if (relatedItem) {
                const displayConf = relatedConfig.displayColumn;
                displayName = typeof displayConf === 'function' ? displayConf(relatedItem) : (relatedItem[displayConf] || `${cellValue}`);
            }
            return (<Tooltip title={`ID: ${cellValue}`} placement="top" arrow><Box component="span"
                                                                                   onClick={(e) => e.stopPropagation()}
                                                                                   onDoubleClick={() => onNavigate(column.references, cellValue)}
                                                                                   sx={{
                                                                                       cursor: 'pointer',
                                                                                       color: 'primary.main',
                                                                                       textDecoration: 'underline'
                                                                                   }}>{displayName}</Box></Tooltip>);
        }
        return cellValue;
    };

    const processedData = useMemo(() => {
        let processed = [...data];
        if (filterQuery) {
            const lowercasedQuery = filterQuery.toLowerCase();
            processed = processed.filter(item => {
                const searchableValues = currentTableConfig.columns.map(col =>
                    getDisplayValueForRow(col, item)
                );

                return searchableValues.some(value =>
                    value.toLowerCase().includes(lowercasedQuery)
                );
            });
        }
        if (orderBy) {
            processed.sort((a, b) => {
                if (b[orderBy] == null) return -1;
                if (a[orderBy] == null) return 1;
                if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
                if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return processed;
    }, [data, order, orderBy, filterQuery]);

    const handleAddClick = (e) => {
        e.stopPropagation();
        setItemToEdit(null);
        setFormDialogOpen(true);
    };
    const handleEditClick = (e, item) => {
        e.stopPropagation();
        setItemToEdit(item);
        setFormDialogOpen(true);
    };
    const handleDeleteClick = (e, item) => {
        e.stopPropagation();
        setItemToDelete(item);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const pk = currentTableConfig.primaryKey;
            const itemId = Array.isArray(pk) ? JSON.stringify(pk.map(key => itemToDelete[key])) : itemToDelete[pk];
            await apiService.delete(tableName, itemId);
            setConfirmDialogOpen(false);
            setItemToDelete(null);
            await fetchData(false);
        } catch (err) {
            setError(`Не удалось удалить элемент. Ошибка: ${err.message}`);
            setConfirmDialogOpen(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (itemToEdit) {
                const pk = currentTableConfig.primaryKey;
                const itemId = Array.isArray(pk) ? JSON.stringify(pk.map(key => itemToEdit[key])) : itemToEdit[pk];
                await apiService.update(tableName, itemId, formData);
            } else {
                await apiService.create(tableName, formData);
            }
            setFormDialogOpen(false);
            await fetchData(false);
        } catch (err) {
            setError(`Не удалось сохранить данные. Ошибка: ${err.response?.data?.error || err.message}`);
        }
    };

    if (isLoading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress/></Box>;

    return (
        <Box onClick={onClearHighlight}>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <TextField variant="outlined" size="small" placeholder="Поиск..." value={filterQuery}
                           onChange={(e) => setFilterQuery(e.target.value)} onClick={(e) => e.stopPropagation()}
                           InputProps={{
                               startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>),
                           }}/>
                <Button variant="contained" startIcon={<AddIcon/>} onClick={handleAddClick}>Добавить</Button>
            </Box>
            <Paper sx={{width: '100%', overflow: 'hidden'}} onClick={(e) => e.stopPropagation()}>
                <TableContainer sx={{maxHeight: 'calc(100vh - 310px)'}}>
                    <Table stickyHeader>
                        <TableHead><TableRow>{currentTableConfig.columns.map((column) => (<TableCell key={column.key}
                                                                                                     sortDirection={orderBy === column.key ? order : false}><TableSortLabel
                            active={orderBy === column.key} direction={orderBy === column.key ? order : 'asc'}
                            onClick={() => handleSortRequest(column.key)}>{column.name}</TableSortLabel></TableCell>))}
                            <TableCell align="right" sx={{
                                fontWeight: 'bold',
                                minWidth: '120px'
                            }}>Действия</TableCell></TableRow></TableHead>
                        <TableBody>
                            {processedData.map((row) => {
                                const pk = currentTableConfig.primaryKey;
                                const rowId = Array.isArray(pk) ? row[pk[0]] : row[pk];
                                const isHighlighted = rowId === highlightedRowId;
                                return (
                                    <TableRow
                                        hover
                                        key={rowId}
                                        ref={isHighlighted ? highlightedRowRef : null}
                                        sx={(theme) => ({
                                            ...(isHighlighted && {backgroundColor: alpha(theme.palette.primary.main, 0.15)}),
                                            '&:hover': {backgroundColor: theme.palette.action.hover},
                                            transition: 'background-color 0.3s ease',
                                        })}
                                        onMouseEnter={() => {
                                            if (isHighlighted) {
                                                onClearHighlight();
                                            }
                                        }}
                                    >
                                        {currentTableConfig.columns.map((column) => <TableCell
                                            key={column.key}>{renderCellContent(column, row)}</TableCell>)}
                                        <TableCell align="right">
                                            <Tooltip title="Редактировать"><IconButton
                                                onClick={(e) => handleEditClick(e, row)} color="primary"
                                                size="small"><EditIcon/></IconButton></Tooltip>
                                            <Tooltip title="Удалить"><IconButton
                                                onClick={(e) => handleDeleteClick(e, row)} color="secondary"
                                                size="small"><DeleteIcon/></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <div onClick={(e) => e.stopPropagation()}>
                <ConfirmationDialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}
                                    onConfirm={handleConfirmDelete} title="Подтверждение удаления"
                                    message="Вы уверены, что хотите удалить этот элемент? Это действие необратимо."/>
                {currentTableConfig && <FormDialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)}
                                                   onSubmit={handleFormSubmit} item={itemToEdit}
                                                   config={currentTableConfig}/>}
            </div>
        </Box>
    );
}

export default TableView;