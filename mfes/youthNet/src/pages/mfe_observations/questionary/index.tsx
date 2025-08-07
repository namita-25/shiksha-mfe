import dynamic from 'next/dynamic';

import Header from '@/components/Header';
import {
  addEntities,
  fetchEntities,
  fetchQuestion,
} from '@/services/ObservationServices';
import { Button, Typography, useTheme } from '@mui/material';
import { GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'next-i18next';
import EntryContent from '../../../components/youthNet/EntryContent';
import EntrySlider from '../../../components/youthNet/EntrySlider';
import BackHeader from '../../../components/youthNet/BackHeader';
import {
  createAnotherSubmission,
  fetchObservSublist,
} from 'mfes/youthNet/src/services/youthNet/Survey/suveyService';
import AddIcon from '@mui/icons-material/Add';

const ObservationComponent = dynamic(
  () => import('@/components/observations/ObservationComponent'),
  {
    ssr: false,
    // loading: () => <p>Loading Questionnaire App...</p>,
  }
);

const ObservationQuestions: React.FC = () => {
  const router = useRouter();
  const { Id } = router.query;
  const { solutionId } = router.query;
  const { observationName } = router.query;
  const [value, setValue] = useState<number>(1);
  const { t } = useTranslation();
  const [storedEntries, setStoredEntries] = useState([]);

  const [questionResponse, setQuestionResponseResponse] = useState<any>(null);
  const [questions, setQuestions] = useState<any>(null);
  const theme = useTheme<any>();
  const [isAddNew, setIsAddNew] = useState(false);
  const [isBackTab, setIsBackTab] = useState(false);


  //another submission
  const [entityId, setEntityId] = useState('');
  const [observationId, setObservationId] = useState('');
  const [submissionNumber, setSubmissionNumber] = useState(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  useEffect(() => {
    const fetchQuestionsList = async () => {
      try {
        const response = await fetchEntities({ solutionId });
        console.log('########### response', response);
        const completedIds = response?.result?.entities
          ?.filter((entity: any) => entity.status === 'completed' && entity._id)
          ?.map((entity: any) => entity._id);
        const Ids = response?.result?.entities
          ?.filter((entity: any) => entity._id)
          ?.map((entity: any) => entity._id);
        console.log('########### observations', completedIds);
        console.log('########### Ids', Ids);
       // setStoredEntries(completedIds);
        const observationId = response?.result?._id;
        setObservationId(observationId);
        const entityId = localStorage.getItem('userId') || '';
        setEntityId(entityId);
        console.log('########### entityId', entityId);
        const responseObserSubList = await fetchObservSublist({
          observationId,
          entityId,
        });
        // const allIds = responseObserSubList
        //   ?.filter((entity: any) => entity.status === 'completed' && entity._id)
        //   ?.map((entity: any) => entity._id);
        const completedEntries = responseObserSubList
        ?.filter((entity: any) => entity.status === "completed" && entity._id)
        ?.map((entity: any) => ({
          id: entity.entityId,
          submissionCount: entity["submissionNumber"] || 0, 
        }))
        ?.sort((a: any, b: any) =>a.submissionCount - b.submissionCount)
  setStoredEntries(completedEntries)
       
        //get list of submissions
        if (responseObserSubList && responseObserSubList.length == 0) {

        }

        let tempSubmissionNumber = null;
        //not started any submission
        if (
          !Ids.includes(entityId) ||
          (responseObserSubList && responseObserSubList.length == 0)
        ) {
          console.log('########### add new');
          const data = {
            data: [entityId],
          };
          await addEntities({ data, observationId });
          setIsAddNew(true);
        }
        //started but not completed multiple time
        else {
          // Check if any status is "started" and get submission number

          for (let i = 0; i < responseObserSubList.length; i++) {
            if (
              responseObserSubList[i]?.status === 'started' ||
              responseObserSubList[i]?.status === 'draft'
            ) {
              tempSubmissionNumber = responseObserSubList[i].submissionNumber;
              //setIsAddNew(true);
              break; // Exit the loop once found
            }
          }
          setSubmissionNumber(tempSubmissionNumber);
        }
        console.log('########### observationId', observationId);
        //check already submitted

        if (observationId) {
          const response = await fetchQuestion({
            observationId,
            entityId,
            tempSubmissionNumber,
          });

          const combinedData = {
            solution: response.solution,
            assessment: {
              ...response.assessment, // Spread all properties from assessment
            },
          };
          setQuestions(combinedData);
          // setQuestionResponseResponse(
          //   combinedData
          // )
        }
      } catch (error) {
        console.error('Error fetching cohort list', error);
      }
    };
    if (solutionId) fetchQuestionsList();
  }, [Id, solutionId]);
  const handleBack = () => {
    if(submissionNumber && isAddNew===true)
    {
      //add popup for back alert
      const userResponse = confirm("Are you sure you want to go back?");

if (userResponse) {
  // User clicked "OK"
  console.log("User confirmed the action.");
        setIsAddNew(false)
        setIsBackTab(true)

  // Perform the desired action here
} else {
  // User clicked "Cancel"
  console.log("User canceled the action.");
  // Handle the cancellation
}
    }
    else{
      router.back();
    }
  };
  const addAnotherSubmission = async () => {
    try {
      if(submissionNumber !=null && isAddNew===false)
      {
        if (observationId && isBackTab===true) 
        {
          try {
            const response = await fetchEntities({ solutionId });
            console.log('########### response', response);
            const completedIds = response?.result?.entities
              ?.filter((entity: any) => entity.status === 'completed' && entity._id)
              ?.map((entity: any) => entity._id);
            const Ids = response?.result?.entities
              ?.filter((entity: any) => entity._id)
              ?.map((entity: any) => entity._id);
            console.log('########### observations', completedIds);
            console.log('########### Ids', Ids);
           // setStoredEntries(completedIds);
            const observationId = response?.result?._id;
            setObservationId(observationId);
            const entityId = localStorage.getItem('userId') || '';
            setEntityId(entityId);
            console.log('########### entityId', entityId);
            const responseObserSubList = await fetchObservSublist({
              observationId,
              entityId,
            });
            // const allIds = responseObserSubList
            //   ?.filter((entity: any) => entity.status === 'completed' && entity._id)
            //   ?.map((entity: any) => entity._id);
            const completedEntries = responseObserSubList
            ?.filter((entity: any) => entity.status === "completed" && entity._id)
            ?.map((entity: any) => ({
              id: entity.entityId,
              submissionCount: entity["submissionNumber"] || 0, 
            }))
            ?.sort((a: any, b: any) =>a.submissionCount - b.submissionCount)
      setStoredEntries(completedEntries)
           
            //get list of submissions
            if (responseObserSubList && responseObserSubList.length == 0) {
    
            }
    
            let tempSubmissionNumber = null;
            //not started any submission
            if (
              !Ids.includes(entityId) ||
              (responseObserSubList && responseObserSubList.length == 0)
            ) {
              console.log('########### add new');
              const data = {
                data: [entityId],
              };
              await addEntities({ data, observationId });
              setIsAddNew(true);
            }
            //started but not completed multiple time
            else {
              // Check if any status is "started" and get submission number
    
              for (let i = 0; i < responseObserSubList.length; i++) {
                if (
                  responseObserSubList[i]?.status === 'started' ||
                  responseObserSubList[i]?.status === 'draft'
                ) {
                  tempSubmissionNumber = responseObserSubList[i].submissionNumber;
                  //setIsAddNew(true);
                  break; // Exit the loop once found
                }
              }
              setSubmissionNumber(tempSubmissionNumber);
            }
            console.log('########### observationId', observationId);
            //check already submitted
    
            if (observationId) {
              const response = await fetchQuestion({
                observationId,
                entityId,
                tempSubmissionNumber,
              });
    
              const combinedData = {
                solution: response.solution,
                assessment: {
                  ...response.assessment, // Spread all properties from assessment
                },
              };
              setQuestions(combinedData);
              // setQuestionResponseResponse(
              //   combinedData
              // )
            }
          } catch (error) {
            console.error('Error fetching cohort list', error);
          }
        }
        
        setIsAddNew(true)
        
      }
      else{
        console.log(' ####### ###addnew observationId', observationId);
        console.log(' ####### ###addnew entityId', entityId);
        const responseCreateObserSub = await createAnotherSubmission({
          observationId,
          entityId,
        });
        console.log('########### responseCreateObserSub', responseCreateObserSub);
        //call list api
        const responseObserSubList = await fetchObservSublist({
          observationId,
          entityId,
        });
  
        console.log('########### responseObserSubList', responseObserSubList);
       // router.push('/mfe_observations/questionary/reload');
      //  setIsAddNew(true)
      try {
        const response = await fetchEntities({ solutionId });
        const completedIds = response?.result?.entities
          ?.filter((entity: any) => entity.status === 'completed' && entity._id)
          ?.map((entity: any) => entity._id);
        const Ids = response?.result?.entities
          ?.filter((entity: any) => entity._id)
          ?.map((entity: any) => entity._id);
           // setStoredEntries(completedIds);
        const observationId = response?.result?._id;
        setObservationId(observationId);
        const entityId = localStorage.getItem('userId') || '';
        setEntityId(entityId);
        const responseObserSubList = await fetchObservSublist({
          observationId,
          entityId,
        });
        // const allIds = responseObserSubList
        //   ?.filter((entity: any) => entity.status === 'completed' && entity._id)
        //   ?.map((entity: any) => entity._id);
        const completedEntries = responseObserSubList
        ?.filter((entity: any) => entity.status === "completed" && entity._id)
        ?.map((entity: any) => ({
          id: entity.entityId,
          submissionCount: entity["submissionNumber"] || 0, 
        }))
        ?.sort((a: any, b: any) =>a.submissionCount - b.submissionCount)
  setStoredEntries(completedEntries)
       
        //get list of submissions
        if (responseObserSubList && responseObserSubList.length == 0) {

        }

        let tempSubmissionNumber = null;
        //not started any submission
        if (
          !Ids.includes(entityId) ||
          (responseObserSubList && responseObserSubList.length == 0)
        ) {
          const data = {
            data: [entityId],
          };
          await addEntities({ data, observationId });
          setIsAddNew(true);
        }
        //started but not completed multiple time
        else {
          // Check if any status is "started" and get submission number

          for (let i = 0; i < responseObserSubList.length; i++) {
            if (
              responseObserSubList[i]?.status === 'started' ||
              responseObserSubList[i]?.status === 'draft'
            ) {
              tempSubmissionNumber = responseObserSubList[i].submissionNumber;
              //setIsAddNew(true);
              break; // Exit the loop once found
            }
          }
          setSubmissionNumber(tempSubmissionNumber);
        }
        //check already submitted

        if (observationId) {
          const response = await fetchQuestion({
            observationId,
            entityId,
            tempSubmissionNumber,
          });

          const combinedData = {
            solution: response.solution,
            assessment: {
              ...response.assessment, // Spread all properties from assessment
            },
          };
          setQuestions(combinedData);
          // setQuestionResponseResponse(
          //   combinedData
          // )
        }
      } catch (error) {
        console.error('Error fetching cohort list', error);
      }
      setIsAddNew(true)
      }
      //createAnotherSubmission
     
      //not started any submission
      /*if (
        !Ids.includes(entityId) ||
        (responseObserSubList && responseObserSubList.length == 0)
      ) {
        console.log('########### add new');
        const data = {
          data: [entityId],
        };
        await addEntities({ data, observationId });
        setIsAddNew(true);
      }
      //started but not completed
      else if (responseObserSubList.length > 0) {
        console.log(
          '########### responseObserSubList.length ',
          responseObserSubList.length
        );
        console.log(
          '########### responseObserSubList[responseObserSubList.length]?.status ',
          responseObserSubList[responseObserSubList.length - 1]?.status
        );
        if (
          responseObserSubList[responseObserSubList.length - 1]?.status ===
            'started' ||
          responseObserSubList[responseObserSubList.length - 1]?.status ===
            'draft'
        ) {
          setIsAddNew(true);
        }
      }

      console.log('########### observationId', observationId);
      //check already submitted

      if (observationId) {
        const response = await fetchQuestion({ observationId, entityId });
        const combinedData = {
          solution: response.solution,
          assessment: {
            ...response.assessment, // Spread all properties from assessment
          },
        };
        setQuestions(combinedData);
        // setQuestionResponseResponse(
        //   combinedData
        // )
      }*/
    } catch (error) {
      console.error('Error fetching cohort list', error);
    }
  };
  return (
    <Box>
      {/* <Header /> */}
      <Box>
        <BackHeader
          headingOne={observationName?.toString()}
          showBackButton={true}
          onBackClick={handleBack}
        />

        {/* { observationName&& (
          <Typography variant="h3" fontSize={'22px'}
            color={'black'}>
              {observationName}
          </Typography>
        )} */}
      </Box>
      {/* <Box sx={{ width: '100%' }}>
        {value && (
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit" // Use "inherit" to apply custom color
            aria-label="secondary tabs example"
            sx={{
              fontSize: '14px',
              borderBottom: (theme) => `1px solid #EBE1D4`,

              '& .MuiTab-root': {
                color: theme.palette.warning['A200'],
                padding: '0 20px',
                flexGrow: 1,
              },
              '& .Mui-selected': {
                color: theme.palette.warning['A200'],
              },
              '& .MuiTabs-indicator': {
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '100px',
                height: '3px',
              },
              '& .MuiTabs-scroller': {
                overflowX: 'unset !important',
              },
            }}
          >
            <Tab value={1} label={'submit New'} />
            <Tab value={2} label={t('Submissions')} />
          </Tabs>
        )}
      </Box> */}
      {/* <Box>
        {value === 1 && (
          <Box
            padding={'15px'}
            sx={{
              background: '#FBF4E4',
            }}
          >
            <ObservationComponent
              observationName={observationName}
              observationQuestions={questions}
              backButtonShow={false}
            />
          </Box>
        )}
        {value === 2 && (
          <Box
            padding={'15px'}
            sx={{
              background: '#FBF4E4',
            }}
          >
            <Box>
              {storedEntries.length !== 0 ? (
                <Box width="100%">
                  <EntrySlider>
                    {storedEntries.map((entryId: any, index: any) => (
                      <EntryContent
                        entityId={entryId}
                        questionResponse={questionResponse}
                        setQuestionResponseResponse={
                          setQuestionResponseResponse
                        }
                      />
                    ))}
                  </EntrySlider>
                </Box>
              ) : (
                <Typography ml="25%" mt="10%">
                  {' '}
                  Looks like there are no entries yet
                </Typography>
              )}
            </Box>
            <></>
          </Box>
        )}
      </Box> */}
      <Box>
        {isAddNew ? (
          <Box
            padding={'15px'}
            sx={{
              background: '#FBF4E4',
            }}
          >
            <ObservationComponent
              observationName={observationName}
              observationQuestions={questions}
              backButtonShow={false}
            />
          </Box>
        ) : (
          <Box
            padding={'15px'}
            sx={{
              background: '#FBF4E4',
            }}
          >
            <Button
              sx={{
                border: `1px solid ${theme.palette.error.contrastText}`,
                borderRadius: '100px',
                height: 'auto',
                width: 'auto',
                mt: '10px',
                color: theme.palette.error.contrastText,
                '& .MuiButton-endIcon': {
                  // marginLeft: isRTL ? '0px !important' : '8px !important',
                  // marginRight: isRTL ? '8px !important' : '-2px !important',
                },
              }}
              className="text-1E"
              // onClick={handleOpenAddFaciModal}
              endIcon={<AddIcon />}
              onClick={addAnotherSubmission}
            >
                   {submissionNumber !=null && isAddNew===false? t('COMMON.INPROGRESS'): t('COMMON.ADD_NEW')}
            </Button>
            <Box>
              {storedEntries.length !== 0 ? (
                <Box width="100%">
                  <EntrySlider>
                  {storedEntries?.map((entry: { id: string; submissionCount: number }) => (
                      <EntryContent
                        entityId={entry.id}
                        questionResponse={questionResponse}
                        setQuestionResponseResponse={
                          setQuestionResponseResponse
                        }
                        observationId={observationId}
                        submissionNumber={entry?.submissionCount}
                      />
                    ))}
                  </EntrySlider>
                </Box>
              ) : (
                <Typography ml="25%" mt="10%">
                  {' '}
                  Looks like there are no entries yet
                </Typography>
              )}
            </Box>
            <></>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  };
}
// export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
//   return {
//     paths: [], //indicates that no page needs be created at build time
//     fallback: 'blocking', //indicates the type of fallback
//   };
// };

export default ObservationQuestions;
