import React from 'react';
import {TextField, Grid, Select, MenuItem, FormControl, InputLabel} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {tableConfig} from '../tableConfig';

function DynamicForm({config, formData, setFormData, lookupData}) {
    const {columns, primaryKey} = config;
    const handleTextChange = (event) => {
        const {name, value} = event.target;
        setFormData(prevData => ({...prevData, [name]: value}));
    };
    const handleDateChange = (name, newValue) => {
        const formattedDate = newValue && !isNaN(newValue) ? newValue.toISOString().split('T')[0] : null;
        setFormData(prevData => ({...prevData, [name]: formattedDate}));
    };
    const getDisplayValue = (item, relationName) => {
        const displayConf = tableConfig[relationName]?.displayColumn;
        if (typeof displayConf === 'function') {
            return displayConf(item);
        }
        return item[displayConf] || `ID: ${item[tableConfig[relationName]?.primaryKey]}`;
    };
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

    return (
        <Grid container spacing={2} sx={{mt: 1}}>
            {columns.map((col) => {
                if (col.key === primaryKey && !Array.isArray(primaryKey)) {
                    return null;
                }

                const relationName = getRelationNameFromKey(col.key);
                const hasLookupData = relationName && lookupData && lookupData[relationName];

                if (col.key.toLowerCase().includes('date')) {
                    const stringValue = formData[col.key] || null;
                    const dateObjectValue = stringValue ? new Date(stringValue) : null;

                    return (
                        <Grid item xs={12} key={col.key}>
                            <DatePicker
                                label={col.name}
                                value={dateObjectValue}
                                onChange={(newValue) => handleDateChange(col.key, newValue)}
                                slots={{textField: (params) => <TextField {...params} fullWidth margin="dense"/>}}
                                enableAccessibleFieldDOMStructure={false}
                            />
                        </Grid>
                    );
                }

                if (hasLookupData) {
                    const relatedTablePk = tableConfig[relationName]?.primaryKey;
                    return (
                        <Grid item xs={12} key={col.key}>
                            <FormControl fullWidth margin="dense" sx={{minWidth: 180}}>
                                <InputLabel id={`${col.key}-select-label`}>{col.name}</InputLabel>
                                <Select
                                    labelId={`${col.key}-select-label`}
                                    id={col.key}
                                    name={col.key}
                                    value={formData[col.key] || ''}
                                    label={col.name}
                                    onChange={handleTextChange}
                                >
                                    <MenuItem value=""><em>(не выбрано)</em></MenuItem>
                                    {lookupData[relationName]?.map((option) => (
                                        <MenuItem key={option[relatedTablePk]} value={option[relatedTablePk]}>
                                            {getDisplayValue(option, relationName)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    );
                }

                return (
                    <Grid item xs={12} key={col.key}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            margin="dense"
                            id={col.key}
                            name={col.key}
                            label={col.name}
                            value={formData[col.key] || ''}
                            onChange={handleTextChange}
                            disabled={!!relationName}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
}

export default DynamicForm;