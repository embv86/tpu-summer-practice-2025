import React, {useState, useEffect} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    CircularProgress,
} from '@mui/material';
import DynamicForm from './DynamicForm';
import {apiService} from '../services/apiService';
import {tableConfig} from '../tableConfig';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import ruLocale from 'date-fns/locale/ru';

function FormDialog({open, onClose, onSubmit, item, config}) {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lookupData, setLookupData] = useState({});
    const [lookupLoading, setLookupLoading] = useState(true);
    const getRelationNameFromKey = (key) => {
        if (!key.startsWith('id_')) return null;
        const baseName = key.substring(3).replace(/_/g, '');
        const possibleNames = [`${baseName}s`, baseName];
        for (const name of possibleNames) {
            if (tableConfig[name]) {
                return name;
            }
        }
        return null;
    };

    useEffect(() => {
        if (open) {
            setLookupLoading(true);
            const fetchLookupData = async () => {
                const neededRelations = config.columns
                    .map(col => getRelationNameFromKey(col.key))
                    .filter(Boolean);
                const uniqueRelations = [...new Set(neededRelations)];
                const promises = uniqueRelations.map(relation =>
                    apiService.getAll(relation).then(response => ({
                        name: relation,
                        data: response.data,
                    }))
                );

                try {
                    const results = await Promise.all(promises);
                    const lookups = results.reduce((acc, result) => {
                        acc[result.name] = result.data;
                        return acc;
                    }, {});
                    setLookupData(lookups);
                } catch (error) {
                    console.error("Не удалось загрузить данные для селектов", error);
                } finally {
                    setLookupLoading(false);
                }
            };

            fetchLookupData();
        }
    }, [open, config]);
    useEffect(() => {
        if (open) {
            if (item) {
                setFormData(item);
            } else {
                const emptyData = config.columns.reduce((acc, col) => {
                    if (col.key.toLowerCase().includes('date')) {
                        acc[col.key] = null;
                    } else {
                        acc[col.key] = '';
                    }
                    return acc;
                }, {});
                setFormData(emptyData);
            }
        }
    }, [item, config, open]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>{item ? `Редактировать: ${config.displayName}` : `Добавить: ${config.displayName}`}</DialogTitle>
                <DialogContent>
                    {lookupLoading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                            <CircularProgress/>
                        </Box>
                    ) : (
                        <DynamicForm
                            config={config}
                            formData={formData}
                            setFormData={setFormData}
                            lookupData={lookupData}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{p: '16px 24px'}}>
                    <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                    <Box sx={{position: 'relative'}}>
                        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting || lookupLoading}>
                            Сохранить
                        </Button>
                        {isSubmitting && (
                            <CircularProgress size={24} sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}/>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}

export default FormDialog;