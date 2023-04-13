import React from 'react';
import { Box, Container, Typography, TextField} from "@mui/material";
import { Unstable_Grid2 as Grid } from '@mui/material'; // Grid version 2
import '@fontsource/roboto';
//import Item from '../components/Item';
import { NumericFormat } from 'react-number-format';

import { styled } from "@mui/material";


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

const Home: React.FC = () => {
  return (
    <Box sx={{padding: 3}}>
      <Typography variant="h1" gutterBottom>インスリン</Typography>

      <Box sx={{marginBottom: 10}}>
        <Typography variant="h2" gutterBottom>補正インスリン</Typography>

        {/* 補正インスリン式 */}
        {/* 左辺 */}
        <Grid container xs={12}>
          {/* 分子 */}
          <Grid container xs={11} columns={11}>
            <Grid xs={5}>
              <NumericFormat 
                id="current_BGL" 
                label="食前血糖値" 
                variant="outlined" 
                value={100}
                valueIsNumericString={true}
                isAllowed={(values) => {
                  const { floatValue } = values;
                  if (floatValue) {
                    return 0 < floatValue && floatValue < 1000;
                  }
                  return false;
                }}
                customInput={TextField} 
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
                label="目標血糖値" 
                variant="outlined" 
                value={120}
                valueIsNumericString={true}
                isAllowed={(values) => {
                  const { floatValue } = values;
                  if (floatValue) {
                    return 0 < floatValue && floatValue < 1000;
                  }
                  return false;
                }}
                customInput={TextField} 
                fullWidth
                 />
            </Grid>
          </Grid>           

          {/* 分数線 */}
          <Grid container xs={11}>
            <Grid xs={12}>
              <Line></Line>
            </Grid>
          </Grid>      

          {/* 分母 */}
          <Grid container xs={11}>
            <Grid xs={12}>
              <NumericFormat 
                id="insulin_sensitivity_factor" 
                label="インスリン効果比" 
                variant="outlined" 
                value={80}
                valueIsNumericString={true}
                isAllowed={(values) => {
                  const { floatValue } = values;
                  if (floatValue) {
                    return 0 < floatValue && floatValue < 1000;
                  }
                  return false;
                }}
                customInput={TextField} 
                fullWidth
                 />
            </Grid>
          </Grid>  
        </Grid>

        {/* =右辺 */}
        <Grid container xsOffset={3} xs={9}>

          {/* = */}
          <Grid container xs={1}>
              <Item>
                <Typography variant="body1">=</Typography>
              </Item>
          </Grid>

          {/* 右辺 */}
          <Grid container xs={11}>
              <Item>
                <Typography variant="body1">1.0</Typography>
              </Item>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{marginBottom: 10}}>
        <Typography variant="h2" gutterBottom>糖質インスリン</Typography>

        {/* 糖質インスリン式 */}
        {/* 左辺 */}
        <Grid container xs={12}>
          <Grid container xs={11} columns={11}>
            <Grid xs={5}>
              <NumericFormat 
                id="meal_carbohydrates" 
                label="カーボ数" 
                variant="outlined" 
                value={10.0}
                valueIsNumericString={true}
                allowedDecimalSeparators={['%']}
                isAllowed={(values) => {
                  const { floatValue } = values;
                  if (floatValue) {
                    return 0 < floatValue && floatValue < 1000;
                  }
                  return false;
                }}
                customInput={TextField} 
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
                label="カーボ比" 
                variant="outlined" 
                value={10.0}
                valueIsNumericString={true}
                allowedDecimalSeparators={['%']}
                isAllowed={(values) => {
                  const { floatValue } = values;
                  if (floatValue) {
                    return 0 < floatValue && floatValue < 1000;
                  }
                  return false;
                }}
                customInput={TextField} 
                fullWidth
                 />
            </Grid>
          </Grid>           
        </Grid>

        {/* =右辺 */}
        <Grid container xsOffset={3} xs={9}>

          {/* = */}
          <Grid container xs={1}>
              <Item>
                <Typography variant="body1">=</Typography>
              </Item>
          </Grid>

          {/* 右辺 */}
          <Grid container xs={11}>
              <Item>
                <Typography variant="body1">10.0</Typography>
              </Item>
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
};

export default Home