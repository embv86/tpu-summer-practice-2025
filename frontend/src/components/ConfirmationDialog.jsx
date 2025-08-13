import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';

// Компонент принимает:
// open - boolean, открыто ли окно
// onClose - функция для закрытия окна (вызывается при клике на "Отмена" или вне окна)
// onConfirm - функция, которая выполняется при клике на "Подтвердить"
// title - заголовок окна
// message - текст сообщения внутри окна
function ConfirmationDialog({ open, onClose, onConfirm, title, message }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
        >
            <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={onConfirm} color="secondary" autoFocus>
                    Подтвердить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;