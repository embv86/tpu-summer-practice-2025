import React, {useState} from 'react';
import {
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Collapse,
    List,
    Divider,
    IconButton, // 👈 Импортируем IconButton
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import NotesIcon from '@mui/icons-material/Notes';

function SidebarItem({tableKey, tableInfo, onSelect}) {
    const [open, setOpen] = useState(false);

    const handleToggleExpand = (e) => {
        e.stopPropagation();
        setOpen(!open);
    };

    const hasRelations = tableInfo.relations && tableInfo.relations.length > 0;

    return (
        <>
            <ListItem
                disablePadding
                secondaryAction={
                    <IconButton edge="end" aria-label="expand" onClick={handleToggleExpand}>
                        {open ? <ExpandLess/> : <ExpandMore/>}
                    </IconButton>
                }
            >
                <ListItemButton onClick={() => onSelect(tableKey)}>
                    <ListItemText
                        primary={tableInfo.displayName}
                        sx={{pr: 2}}
                    />
                </ListItemButton>
            </ListItem>

            <Collapse in={open} timeout="auto" unmountOnExit>

                <List component="div" disablePadding>

                    {tableInfo.columns.map(col => (
                        <ListItem key={col.key} sx={{pl: 4}}>
                            <ListItemIcon sx={{minWidth: '40px'}}>
                                {col.key === tableInfo.primaryKey || (Array.isArray(tableInfo.primaryKey) && tableInfo.primaryKey.includes(col.key))
                                    ? <VpnKeyIcon fontSize="small" color="primary"/>
                                    : <NotesIcon fontSize="small" color="action"/>
                                }
                            </ListItemIcon>
                            <ListItemText primary={col.name} secondary={col.key}/>
                        </ListItem>
                    ))}

                    {hasRelations && (
                        <>
                            <Divider variant="middle" component="li"/>
                            {tableInfo.relations.map(rel => (
                                <ListItem key={rel} sx={{pl: 4}}>
                                    <ListItemIcon sx={{minWidth: '40px'}}>
                                        <LinkIcon fontSize="small" color="action"/>
                                    </ListItemIcon>
                                    <ListItemText primary={rel}/>
                                </ListItem>
                            ))}
                        </>
                    )}

                </List>
            </Collapse>
        </>
    );
}

export default SidebarItem;