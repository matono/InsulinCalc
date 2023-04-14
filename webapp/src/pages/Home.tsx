import React from 'react';
import { Box, Paper, Container, Typography, TextField} from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';

import { Unstable_Grid2 as Grid } from '@mui/material'; // Grid version 2
import '@fontsource/roboto';
//import Item from '../components/Item';
import { NumericFormat } from 'react-number-format';

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';



const Line = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  borderTop: '1px solid',
  padding: theme.spacing(0),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  flex: 1,
}));

const Item = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  border: '0px solid',
  borderColor: theme.palette.mode === 'dark' ? '#444d58' : '#ced7e0',
  padding: theme.spacing(2),
  textAlign: 'center',
  flex: 1,
}));

const theme = createTheme();

const Home: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };
  
  return (
    <ThemeProvider theme={theme}>
      
      <Container component="main" maxWidth="xl">
        <CssBaseline />
        <Box
          sx={{
            mt: 5,
            flexDirection: 'column',
          }}
        >
          
          <Typography component="h1" variant="h4" gutterBottom>インスリン</Typography>

          <Paper component="form" onSubmit={handleSubmit} sx={{ mt: 3, p:2 }} >
            <Typography component="h2" variant="h5" sx={{ mb: 3}}>糖質インスリン</Typography>

            {/* 糖質インスリン式 */}
            {/* 左辺 */}
            <Grid container columns={11}>
              <Grid xs={5}>
                <NumericFormat 
                  id="meal_carbohydrates" 
                  value={10.00}
                  type="text"
                  valueIsNumericString={true}
                  decimalSeparator="."
                  thousandSeparator=","
                  allowNegative={false}
                  decimalScale={2}
                  fixedDecimalScale              
                  inputProps={{ 
                    inputMode: 'decimal', 
                    pattern: '[0-9].*' 
                  }}
                  customInput={TextField} 
                  label="カーボ数" 
                  variant="outlined" 
                  fullWidth
                    />
              </Grid>
              
              <Grid xs={1}>
                <Item>
                  <Typography variant="body1">x</Typography>
                </Item>
              </Grid>

              <Grid xs={5}>
                <NumericFormat 
                  id="insulin_to_carb_ratio" 
                  value={1.0}
                  type="text"
                  valueIsNumericString={true}
                  decimalSeparator="."
                  thousandSeparator=","
                  allowNegative={false}
                  decimalScale={1}
                  fixedDecimalScale              
                  inputProps={{ 
                    inputMode: 'decimal', 
                    pattern: '[0-9].*' 
                  }}
                  customInput={TextField} 
                  label="カーボ比" 
                  variant="outlined" 
                  fullWidth
                    />
              </Grid>
            </Grid>           

            {/* =右辺 */}
            <Grid container xs={12}>

              {/* = */}
              <Grid container xs={1}>
                  <Item>
                    <Typography variant="body1">=</Typography>
                  </Item>
              </Grid>

              {/* 右辺 */}
              <Grid container xs={10}>
                  <Item>
                    <Typography variant="body1">10.0</Typography>
                  </Item>
              </Grid>
            </Grid>
          </Paper>



          <Paper component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, p:2 }}>
           <Typography component="h2" variant="h5" sx={{ mb: 3}}>補正インスリン</Typography>

            {/* 補正インスリン式 */}
            {/* 左辺 */}
            <Grid container columns={11}>
              {/* 分子 */}
              <Grid xs={5}>
                <NumericFormat 
                  id="current_BGL" 
                  value={100}

                  valueIsNumericString={true}
                  decimalSeparator="."
                  thousandSeparator=","
                  allowNegative={false}
                  decimalScale={0}
                  fixedDecimalScale              
                  inputProps={{ 
                    inputMode: 'numeric', 
                    pattern: '[0-9]*' 
                  }}
                  customInput={TextField} 
                  label="食前血糖値" 
                  variant="outlined" 
                  fullWidth
                    />
              </Grid>
              <Grid xs={1}>
                <Item>
                  <Typography variant="body1">-</Typography>
                </Item>
              </Grid>
              <Grid xs={5}>
                <NumericFormat 
                  id="target_BGL" 
                  value={120}

                  valueIsNumericString={true}
                  decimalSeparator="."
                  thousandSeparator=","
                  allowNegative={false}
                  decimalScale={0}
                  fixedDecimalScale              
                  inputProps={{ 
                    inputMode: 'numeric', 
                    pattern: '[0-9]*' 
                  }}
                  customInput={TextField} 
                  label="目標血糖値" 
                  variant="outlined" 
                  fullWidth
                    />
              </Grid>

              {/* 分数線 */}
              <Grid container xs={21}>
                <Line></Line>
              </Grid>      

              {/* 分母 */}
              <Grid container xs={21}>
                <NumericFormat 
                  id="insulin_sensitivity_factor" 
                  value={80}

                  valueIsNumericString={true}
                  decimalSeparator="."
                  thousandSeparator=","
                  allowNegative={false}
                  decimalScale={0}
                  fixedDecimalScale              
                  inputProps={{ 
                    inputMode: 'numeric', 
                    pattern: '[0-9]*' 
                  }}
                  customInput={TextField} 
                  label="インスリン効果比" 
                  variant="outlined" 
                  fullWidth
                    />
              </Grid>
            </Grid>

            {/* =右辺 */}
            <Grid container xs={12}>

              {/* = */}
              <Grid container xs={1}>
                  <Item>
                    <Typography variant="body1">=</Typography>
                  </Item>
              </Grid>

              {/* 右辺 */}
              <Grid container xs={10}>
                  <Item>
                    <Typography variant="body1">1.0</Typography>
                  </Item>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>

    </ThemeProvider>
  );
};

export default Home