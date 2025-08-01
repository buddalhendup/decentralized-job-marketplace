import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

/**
 * Simple top navigation bar.  Displays links to pages and a logo.
 */
export default function Header() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Job Marketplace
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/create">Post Job</Button>
          <Button color="inherit" component={Link} to="/browse">Browse Jobs</Button>
          <Button color="inherit" component={Link} to="/profile">Profile</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
