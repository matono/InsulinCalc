import React from 'react';
import { Link, SxProps, Theme, Typography } from "@mui/material";

interface CopyrightProps {
  sx?: SxProps<Theme>
}
  
const Copyright: React.FC<CopyrightProps> = (props: CopyrightProps) => {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
  
export default Copyright