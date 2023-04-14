import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";

import { Box, Paper, Container, Typography, TextField } from "@mui/material";
import { InputAdornment, IconButton } from "@mui/material";
import { AddCircle, RemoveCircle }  from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import '@fontsource/roboto';

import { NumericFormat } from 'react-number-format';


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

interface InsulinVariables {
  mealCarbohydrates: number;
  insulinToCarbRatio: number;
  carbInsulin: number;
  currentBGL: number;
  targetBGL: number;
  insulinSensitivityFactor: number;
  correctionBolusInsulin: number;
  totalInsulin: number;
}

const today = new Date(); 
const plusYear = new Date(today.setFullYear(today.getFullYear() + 1));
const plusHour = new Date(today.setHours(today.getHours() + 1));

const Home: React.FC = () => {  
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [cookies, setCookie, removeCookie] = useCookies();

  const [mealCarbs, setMealCarbs] = useState([0]);
  const changeMealCarbs = (index: number, value: number) => {
    const data = [...mealCarbs];
    data[index] = value;
    setMealCarbs(data);
  }
  const addMeal = () => {
    setMealCarbs([...mealCarbs, 0]) 
  }
  const deleteMeal = (index: number) => {
    const data = [...mealCarbs];
    data.splice(index, 1);
    setMealCarbs(data);
  }
  useEffect(() => {
    const totalMeal =  mealCarbs.reduce((sum, element) => sum + element, 0);
    setInsVars(vars =>({
      ...vars, 
      mealCarbohydrates: totalMeal,
    }));
  }, [mealCarbs])

  const [insVars, setInsVars] = useState<InsulinVariables>({
    mealCarbohydrates: 0,
    insulinToCarbRatio: cookies.insulinToCarbRatio != undefined? cookies.insulinToCarbRatio : 1.0,
    carbInsulin: 0,
    currentBGL: cookies.currentBGL != undefined? cookies.currentBGL : 100,
    targetBGL: cookies.targetBGL != undefined? cookies.targetBGL : 120,
    insulinSensitivityFactor: cookies.insulinSensitivityFactor != undefined? cookies.insulinSensitivityFactor : 80,
    correctionBolusInsulin: 0,
    totalInsulin: 0,
  });

  useEffect(() => {
    setInsVars(vars =>({
      ...vars, 
      carbInsulin: vars.mealCarbohydrates * vars.insulinToCarbRatio,
    }));
    setCookie("insulinToCarbRatio", insVars.insulinToCarbRatio, { expires: plusYear, path: '/' });
  }, [
    insVars.mealCarbohydrates,
    insVars.insulinToCarbRatio,
  ])

  useEffect(() => {
    setInsVars(vars =>({
      ...vars, 
      correctionBolusInsulin: (vars.currentBGL - vars.targetBGL) / vars.insulinSensitivityFactor,
    }));
    setCookie("currentBGL", insVars.currentBGL, { expires: plusYear, path: '/' });
    setCookie("targetBGL", insVars.targetBGL, { expires: plusYear, path: '/' });
    setCookie("insulinSensitivityFactor", insVars.insulinSensitivityFactor, { expires: plusYear, path: '/' });
  }, [
    insVars.currentBGL,
    insVars.targetBGL,
    insVars.insulinSensitivityFactor,
  ])

  useEffect(() => {
    setInsVars(vars =>({
      ...vars, 
      totalInsulin: vars.carbInsulin + vars.correctionBolusInsulin,
    }));
  }, [
    insVars.carbInsulin,
    insVars.correctionBolusInsulin,
  ])

  return (
    <ThemeProvider theme={theme}>
      
      <Container component="main" maxWidth="xl">
        <CssBaseline />
        <Box
          sx={{
            mt: 3,
            mb: 3,
            flexDirection: 'column',
          }}
        >
          
          <Typography component="h1" variant="body1"  sx={{ mb: 2}} >インスリン</Typography>

          <Paper component="form" sx={{ mb: 3, p:2 }} >
            <Typography component="h2" variant="h5" sx={{ mb: 3}}>糖質インスリン</Typography>

            {/* 糖質インスリン式 */}
            {/* 左辺 */}
            <Grid container rowSpacing={2} columnSpacing={0}>
              <Grid item xs={12}>
                <Grid container columns={11}>
                  <Grid item xs={5}>
                    <Grid container rowSpacing={1}>
                      {
                        mealCarbs.map((input, index) => {
                          return (
                            <Grid item xs={12} key={index}>
                              <NumericFormat 
                                id="meal_carbohydrates" 
                                value={mealCarbs[index]}
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
                                onFocus={event => {
                                  event.target.select();
                                }}
                                onValueChange={(values, sourceInfo) => {
                                  changeMealCarbs(index, values.floatValue as number)
                                }}
                                InputProps={{
                                  endAdornment:
                                    <InputAdornment position="end">
                                      { index == (mealCarbs.length - 1) &&
                                        <IconButton
                                          onClick={addMeal}
                                          onMouseDown={handleMouseDown}
                                          edge="end"
                                        >
                                          <AddCircle />
                                        </IconButton>
                                      }
                                      <IconButton
                                        onClick={event => deleteMeal(index)}
                                        onMouseDown={handleMouseDown}
                                        edge="end"
                                      >
                                        <RemoveCircle />
                                      </IconButton>
                                    </InputAdornment>
                                }}
                                customInput={TextField} 
                                label="カーボ数" 
                                variant="outlined" 
                                fullWidth
                                  />
                            </Grid>
                          )
                        })
                      }
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">x</Typography>
                    </Item>
                  </Grid>

                  <Grid item xs={5}>
                    <NumericFormat 
                      id="insulin_to_carb_ratio" 
                      value={insVars.insulinToCarbRatio}
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
                      onFocus={event => {
                        event.target.select();
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: values.floatValue as number,
                        });
                      }}
                      customInput={TextField} 
                      label="カーボ比" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                      <Item>
                        <Typography variant="body1">=</Typography>
                      </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="carb_insulin" 
                      value={insVars.carbInsulin}
                      inputProps={{ readOnly: true }}
                      type="text"
                      customInput={TextField} 
                      label="糖質インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Paper component="form" sx={{ mb: 3, p:2 }}>
           <Typography component="h2" variant="h5" sx={{ mb: 3}}>補正インスリン</Typography>

            {/* 補正インスリン式 */}
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                
                {/* 分数 */}
                <Grid container>
                  {/* 分子 */}
                  <Grid item xs={12}>
                    <Grid container columns={11}>
                      <Grid item xs={5}>
                        <NumericFormat 
                          id="current_BGL" 
                          value={insVars.currentBGL}
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
                          onFocus={event => {
                            event.target.select();
                          }}
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              currentBGL: values.floatValue as number,
                            });
                          }}
                          customInput={TextField} 
                          label="食前血糖値" 
                          variant="outlined" 
                          fullWidth
                            />
                      </Grid>

                      <Grid item xs={1}>
                        <Item>
                          <Typography variant="body1">-</Typography>
                        </Item>
                      </Grid>

                      <Grid item xs={5}>
                        <NumericFormat 
                          id="target_BGL" 
                          value={insVars.targetBGL}
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
                          onFocus={event => {
                            event.target.select();
                          }}
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              targetBGL: values.floatValue as number,
                            });
                          }}
                          customInput={TextField} 
                          label="目標血糖値" 
                          variant="outlined" 
                          fullWidth
                            />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* 分数線 */}
                  <Grid item xs={12}>
                    <Line></Line>
                  </Grid>      

                  {/* 分母 */}
                  <Grid item xs={12}>
                    <NumericFormat 
                      id="insulin_sensitivity_factor" 
                      value={insVars.insulinSensitivityFactor}
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
                      onFocus={event => {
                        event.target.select();
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinSensitivityFactor: values.floatValue as number,
                        });
                      }}
                      customInput={TextField} 
                      label="インスリン効果比" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>

              {/* =右辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">=</Typography>
                    </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="correction_bolus_insulin" 
                      value={insVars.correctionBolusInsulin}
                      inputProps={{ readOnly: true }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="補正インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          

          <Paper component="form" sx={{ mb: 3, p:2 }} >
            <Typography component="h2" variant="h5" sx={{ mb: 3}}>合計インスリン</Typography>

            {/* 合計インスリン式 */}
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>
                  <Grid item xs={5}>
                    <NumericFormat 
                      id="carb_insulin2" 
                      value={insVars.carbInsulin}
                      inputProps={{ readOnly: true }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="糖質インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                  
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">+</Typography>
                    </Item>
                  </Grid>

                  <Grid item xs={5}>
                    <NumericFormat 
                      id="correction_bolus_insulin2" 
                      value={insVars.correctionBolusInsulin}
                      inputProps={{ readOnly: true }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="補正インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>  

              {/* =右辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">=</Typography>
                    </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="total_insulin" 
                      value={insVars.totalInsulin}
                      inputProps={{ readOnly: true }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="合計インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>  
            </Grid>
          </Paper>

        </Box>
      </Container>

    </ThemeProvider>
  );
};

export default Home