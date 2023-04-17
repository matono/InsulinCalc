import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";

import { Box, Button, Paper, Container, Modal, Typography, TextField } from "@mui/material";
import { InputAdornment, IconButton, Fab } from "@mui/material";
import Add from '@mui/icons-material/Add';
import Remove   from '@mui/icons-material/RemoveCircle';
import Submit from '@mui/icons-material/Autorenew';
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

const Round = (value: number, base: number) => {
  const pow = (10 ** base);
  return Math.round(value * pow) / pow;
}

const Home: React.FC = () => {  
  const [cookies, setCookie, removeCookie] = useCookies();
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [mealCarbs, setMealCarbs] = useState(
    cookies.mealCarbs != undefined ? cookies.mealCarbs as number[]: [0]
  );
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
    setCookie("mealCarbs", mealCarbs, { expires: plusHour, path: '/' });
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

  useEffect(() => calcCarbInsulin(insVars.mealCarbohydrates, insVars.insulinToCarbRatio), [
    insVars.mealCarbohydrates,
    insVars.insulinToCarbRatio,
  ])
  const calcCarbInsulin = (meal: number, ratio: number) => {
    //console.log("calcCarbInsulin");
    setInsVars(vars => ({
      ...vars, 
      carbInsulin: Round(meal * ratio, 2),
    }));
    setCookie("insulinToCarbRatio", insVars.insulinToCarbRatio, { expires: plusYear, path: '/' });
  }

  useEffect(() => {calcCorrectionBolusInsulin(insVars.currentBGL, insVars.targetBGL, insVars.insulinSensitivityFactor)}, [
    insVars.currentBGL,
    insVars.targetBGL,
    insVars.insulinSensitivityFactor,
  ])
  const calcCorrectionBolusInsulin = (current: number, target: number, factor: number) => {
    //console.log("calcCorrectionBolusInsulin")
    setInsVars(vars => ({
      ...vars, 
      correctionBolusInsulin: Round((current - target) / factor, 2),
    }));
    setCookie("currentBGL", insVars.currentBGL, { expires: plusYear, path: '/' });
    setCookie("targetBGL", insVars.targetBGL, { expires: plusYear, path: '/' });
    setCookie("insulinSensitivityFactor", insVars.insulinSensitivityFactor, { expires: plusYear, path: '/' });
  }

  useEffect(() => {calcTotalInsulin(insVars.carbInsulin, insVars.correctionBolusInsulin)}, [
    insVars.carbInsulin,
    insVars.correctionBolusInsulin,
  ])
  const calcTotalInsulin = (carb: number, bolus: number) => {
    //console.log("calcTotalInsulin")
    setInsVars(vars => ({
      ...vars, 
      totalInsulin: Round(carb + bolus, 2),
    }));
  }
  
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => {
    //console.log("handleOpen")
    calcCarbInsulin(insVars.mealCarbohydrates, insVars.insulinToCarbRatio);
    calcCorrectionBolusInsulin(insVars.currentBGL, insVars.targetBGL, insVars.insulinSensitivityFactor);
    calcTotalInsulin(insVars.carbInsulin, insVars.correctionBolusInsulin);
    setOpen(true);
  }

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
          
          <Paper component="form" sx={{ mb: 3, p:2 }}>
            <Grid container direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3}}>
              <Grid item xs={10}>
                <Typography component="h2" variant="h5" >糖質インスリン</Typography>
              </Grid>
              <Grid item xs={2}>    
                <Fab size="medium" color="primary" aria-label="add" onClick={addMeal} onMouseDown={handleMouseDown} >
                  <Add />
                </Fab>
              </Grid>
            </Grid>

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
                                onValueChange={(values, sourceInfo) => {
                                  changeMealCarbs(index, values.floatValue as number)
                                }}
                                InputProps={{
                                  endAdornment:
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={event => deleteMeal(index)}
                                        onMouseDown={handleMouseDown}
                                        edge="end"
                                        color="error"
                                      >
                                        <Remove />
                                      </IconButton>
                                    </InputAdornment>
                                }}
                                onFocus={event => {
                                  event.target.select();
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
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
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
                      variant="filled" 
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
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              currentBGL: values.floatValue as number,
                            });
                          }}
                          onFocus={event => {
                            event.target.select();
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
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              targetBGL: values.floatValue as number,
                            });
                          }}
                          onFocus={event => {
                            event.target.select();
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
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinSensitivityFactor: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
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
                      variant="filled" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mb: 3 }}>
            <Grid container direction="row" justifyContent="center" alignItems="center">
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<Submit />} 
                  size="large"
                  fullWidth   
                  onClick={handleOpen} >
                  計算
                </Button>
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 400,
                      bgcolor: 'background.paper',
                      border: '2px solid #000',
                      boxShadow: 24,
                      p: 4,
                  }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                      インスリン単位数
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                      {insVars.totalInsulin}
                    </Typography>
                  </Box>
                </Modal>
              </Grid>
            </Grid>
          </Box>

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
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          carbInsulin: values.floatValue as number,
                        });
                      }}
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
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={true}
                      decimalScale={2}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          correctionBolusInsulin: values.floatValue as number,
                        });
                      }}
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
                      variant="filled" 
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