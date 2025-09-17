import React from 'react';
import {tableConfig} from '../tableConfig';
import SidebarItem from './SidebarItem';
import {Paper, List, Divider} from '@mui/material';

function Sidebar({onSelectTable}) {
    const tableKeys = Object.keys(tableConfig);

    return (
        <Paper
            sx={{
                width: 280,
                flexShrink: 0,
                overflowY: 'auto',
                height: '100%',
            }}
            elevation={2}
        >
            <List component="nav" disablePadding>
                {tableKeys.map((tableKey, index) => (
                    <React.Fragment key={tableKey}>
                        <SidebarItem
                            tableKey={tableKey}
                            tableInfo={tableConfig[tableKey]}
                            onSelect={onSelectTable}
                        />
                        {index < tableKeys.length - 1 && (
                            <Divider variant="fullWidth" component="li"/>
                        )}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}

export default Sidebar;