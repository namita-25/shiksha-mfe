'use client';

import { Button, Typography, useTheme } from '@mui/material';
import { Suspense, useEffect, useState } from 'react';
import { Box, Grid, Tab, Tabs } from '@mui/material';

import {
  createAnotherSubmission,
  fetchObservSublist,
} from 'mfes/youthNet/src/services/youthNet/Survey/suveyService';
import AddIcon from '@mui/icons-material/Add';
import BackHeader from 'mfes/survey-observations/src/Components/BackHeader/BackHeader';
import EntrySlider from 'mfes/survey-observations/src/Components/EntrySlider/EntrySlider';
import EntryContent from 'mfes/survey-observations/src/Components/EntryContent/EntryContent';
import { useRouter, useSearchParams } from 'next/navigation';
import ObservationComponent from 'mfes/survey-observations/src/Components/ObservationComponent/ObservationComponent';
import { set } from 'lodash';
import {
  addEntities,
  fetchEntities,
  fetchQuestion,
} from 'mfes/survey-observations/src/utils/API/suveyService';
import { useTranslation } from '@shared-lib';

const ObservationQuestions: React.FC = () => {
  const searchParams = useSearchParams();

  const router = useRouter();
  const observationName = searchParams.get('observationName');
  const solutionId = searchParams.get('solutionId');
  const Id = searchParams.get('Id');

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
  console.log(submissionNumber);

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
          ?.filter((entity: any) => entity.status === 'completed' && entity._id)
          ?.map((entity: any) => ({
            id: entity.entityId,
            submissionCount: entity['submissionNumber'] || 0,
          }))
          ?.sort((a: any, b: any) => a.submissionCount - b.submissionCount);
        setStoredEntries(completedEntries);

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
          console.log(tempSubmissionNumber);
        }
        console.log(submissionNumber);
        console.log('########### observationId', isAddNew);

        //check already submitted

        if (observationId) {
          console.log('hii');
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
          console.log('hii');
          //  setIsAddNew(true);
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
    if (submissionNumber && isAddNew === true) {
      //add popup for back alert
      const userResponse = confirm('Are you sure you want to go back?');

      if (userResponse) {
        // User clicked "OK"
        console.log('User confirmed the action.');
        setIsAddNew(false);
        setIsBackTab(true);

        // Perform the desired action here
      } else {
        // User clicked "Cancel"
        console.log('User canceled the action.');
        // Handle the cancellation
      }
    } else {
      router.back();
    }
  };
  console.log(isAddNew);
  console.log(submissionNumber);

  const addAnotherSubmission = async () => {
    try {
      console.log(isAddNew);
      if (submissionNumber != null && isAddNew === false) {
        if (observationId && isBackTab === true) {
          try {
            const response = await fetchEntities({ solutionId });
            console.log('########### response', response);
            const completedIds = response?.result?.entities
              ?.filter(
                (entity: any) => entity.status === 'completed' && entity._id
              )
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
              ?.filter(
                (entity: any) => entity.status === 'completed' && entity._id
              )
              ?.map((entity: any) => ({
                id: entity.entityId,
                submissionCount: entity['submissionNumber'] || 0,
              }))
              ?.sort((a: any, b: any) => a.submissionCount - b.submissionCount);
            setStoredEntries(completedEntries);

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
                  tempSubmissionNumber =
                    responseObserSubList[i].submissionNumber;
                  //setIsAddNew(true);
                  break; // Exit the loop once found
                }
              }
              setSubmissionNumber(tempSubmissionNumber);
              console.log(tempSubmissionNumber);
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
        }
        console.log('hii');
        setIsAddNew(true);
      } else {
        console.log(' ####### ###addnew observationId', observationId);
        console.log(' ####### ###addnew entityId', entityId);
        const responseCreateObserSub = await createAnotherSubmission({
          observationId,
          entityId,
        });
        console.log(
          '########### responseCreateObserSub',
          responseCreateObserSub
        );
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
            ?.filter(
              (entity: any) => entity.status === 'completed' && entity._id
            )
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
            ?.filter(
              (entity: any) => entity.status === 'completed' && entity._id
            )
            ?.map((entity: any) => ({
              id: entity.entityId,
              submissionCount: entity['submissionNumber'] || 0,
            }))
            ?.sort((a: any, b: any) => a.submissionCount - b.submissionCount);
          setStoredEntries(completedEntries);

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
            console.log(tempSubmissionNumber);
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
        setIsAddNew(true);
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
      </Box>

      <Box
        sx={{
          width: { xs: '90%', sm: '80%', md: '70%', lg: 900 },
          height: isAddNew ? 'auto' : { xs: 'auto', md: 600 },
          mx: 'auto',
          gap: 3,
          borderRadius: '24px',
          padding: { xs: 1, sm: 3, md: 4 },
          background: '#FBF4E4',
        }}
      >
        {isAddNew ? (
          <Box padding={{ xs: '10px', md: '15px' }}>
            <ObservationComponent
              observationName={observationName}
              observationQuestions={questions}
              backButtonShow={false}
            />
          </Box>
        ) : (
          <Box
            padding={{ xs: '10px', md: '15px' }}
            sx={{
              background: '#FBF4E4',
            }}
          >
            <Button
              color="primary"
              sx={{
                borderRadius: '100px',
                height: 'auto',
                width: 'fit-content',
                my: 2,
                bgcolor: '#FDBE16',
              }}
              endIcon={<AddIcon />}
              onClick={addAnotherSubmission}
            >
              {submissionNumber != null && !isAddNew
                ? t('COMMON.INPROGRESS')
                : t('COMMON.ADD_NEW')}
            </Button>

            <Box>
              {storedEntries.length !== 0 ? (
                <Box width="100%">
                  <EntrySlider>
                    {storedEntries?.map(
                      (entry: { id: string; submissionCount: number }) => (
                        <EntryContent
                          key={entry.id}
                          entityId={entry.id}
                          questionResponse={questionResponse}
                          setQuestionResponseResponse={
                            setQuestionResponseResponse
                          }
                          observationId={observationId}
                          submissionNumber={entry?.submissionCount}
                        />
                      )
                    )}
                  </EntrySlider>
                </Box>
              ) : (
                <Typography
                  textAlign="center"
                  mt={5}
                  fontSize={{ xs: '16px', md: '18px' }}
                >
                  Looks like there are no entries yet
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
//   return {
//     paths: [], //indicates that no page needs be created at build time
//     fallback: 'blocking', //indicates the type of fallback
//   };
// };

export default ObservationQuestions;
