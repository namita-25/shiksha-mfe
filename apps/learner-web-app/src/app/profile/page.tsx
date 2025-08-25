"use client";

import React, { useEffect, useState } from "react";
import { Alert, Box, Typography, Container, Grid, Button } from "@mui/material";
import Layout from "../../components/Layout";
import UserProfileCard from "@learner/components/UserProfileCard/UserProfileCard";
import CourseCertificateCard from "@learner/components/CourseCertificateCard/CourseCertificateCard";
import { courseWiseLernerList } from "@shared-lib-v2/utils/CertificateService/coursesCertificates";
import { CertificateModal, get } from "@shared-lib";
import { useRouter } from "next/navigation";
import { checkAuth } from "@shared-lib-v2/utils/AuthService";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { baseurl } from "@learner/utils/API/EndUrls";
import { Info } from "@mui/icons-material";
import { showToastMessage } from "@learner/components/ToastComponent/Toastify";

type FilterDetails = {
  status?: string[];
  tenantId?: string;
  userId?: string;
};
const ProfilePage = () => {
  const router = useRouter();

  const [filters] = useState<FilterDetails>({
    status: ["completed", "viewCertificate"],
    tenantId:
      (typeof window !== "undefined" && localStorage.getItem("tenantId")) || "",
    userId:
      (typeof window !== "undefined" && localStorage.getItem("userId")) || "",
  });
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState("");
  const [courseData, setCourseData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const handlePreview = async (id: string) => {
    try {
      if (!id) {
        showToastMessage("Certification Id not found", "error");
        return;
      }
      console.log("Opening certificate with ID:", id);
      setCertificateId(id);
      setShowCertificate(true);
    } catch (error) {
      console.error("Error opening certificate:", error);
      showToastMessage("Error opening certificate", "error");
    }
  };

  useEffect(() => {
    const prepareCertificateData = async () => {
      try {
        setLoading(true);
        const finalArray = [];

        const response = await courseWiseLernerList({ filters });
        console.log("response", response.data);

        for (const item of response.data) {
          try {
            console.log(`Fetching details for courseId: ${item.courseId}`);
            const Details: any = await get(
              `${baseurl}/action/content/v3/read/${item.courseId}`,
              {
                tenantId: localStorage.getItem("tenantId") || "",
                Authorization: `Bearer ${
                  localStorage.getItem("accToken") || ""
                }`,
              }
            );
            console.log("courseDetails", Details);

            if (
              !Details.data ||
              !Details.data.result ||
              !Details.data.result.content
            ) {
              console.error("Invalid course details response:", Details);
              throw new Error("Invalid course details response");
            }

            let courseDetails = Details.data.result.content;
            console.log("Extracted course details:", {
              name: courseDetails.name,
              title: courseDetails.title,
              program: courseDetails.program,
              description: courseDetails.description,
              posterImage: courseDetails.posterImage,
            });

            // Try different possible field names for the course title
            const courseTitle =
              courseDetails.name ||
              courseDetails.title ||
              courseDetails.program ||
              `Course ${item.courseId.slice(-8)}`;

            const obj = {
              usercertificateId: item.usercertificateId,
              userId: item.userId,
              courseId: item.courseId,
              certificateId: item.certificateId,
              completedOn: item.issuedOn,
              description:
                courseDetails.description || "Course completion certificate",
              posterImage: courseDetails.posterImage || "/images/image_ver.png",
              program: courseTitle,
            };
            console.log("Created certificate object:", obj);
            finalArray.push(obj);
          } catch (error) {
            console.error(
              `Failed to fetch course details for courseId: ${item.courseId}`,
              error
            );
            // Create a basic certificate object even if course details fail
            const obj = {
              usercertificateId: item.usercertificateId,
              userId: item.userId,
              courseId: item.courseId,
              certificateId: item.certificateId,
              completedOn: item.issuedOn,
              description: "Course completion certificate",
              posterImage: "/images/image_ver.png",
              program: `Course ${item.courseId.slice(-8)}`,
            };
            console.log("Created fallback certificate object:", obj);
            finalArray.push(obj);
          }
        }
        console.log("finalArray", finalArray);

        // Add a test certificate if no certificates were found
        if (finalArray.length === 0) {
          console.log("No certificates found, adding test certificate");
          finalArray.push({
            usercertificateId: "test-id",
            userId: "test-user",
            courseId: "test-course",
            certificateId: "did:rcw:test-certificate-id",
            completedOn: new Date().toISOString(),
            description: "Test certificate description",
            posterImage: "/images/image_ver.png",
            program: "Test Course",
          });
        }

        setCourseData(finalArray);
      } catch (error) {
        console.error("Error fetching certificate data:", error);
        showToastMessage("Error loading certificates", "error");
      } finally {
        setLoading(false);
      }
    };
    prepareCertificateData();
  }, [filters]);

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/login");
    }
  }, [router]);

  const isYouthNet =
    typeof window !== "undefined" &&
    localStorage.getItem("userProgram") === "YouthNet";

  // Show certificates section if user has certificates or is YouthNet
  const shouldShowCertificates = courseData.length > 0 || isYouthNet;

  // Debug logging
  console.log("Profile page state:", {
    courseDataLength: courseData.length,
    isYouthNet,
    shouldShowCertificates,
    courseData: courseData,
  });

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard")}
            sx={{
              color: "#78590C",
              borderColor: "#78590C",
              "&:hover": {
                backgroundColor: "#78590C",
                color: "white",
                borderColor: "#78590C",
              },
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* User Profile Card */}
          <Grid item xs={12} md={shouldShowCertificates ? 4 : 12}>
            <UserProfileCard
              maxWidth={shouldShowCertificates ? "100%" : "100%"}
            />
          </Grid>

          {/* Certificates Section */}
          {shouldShowCertificates && (
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: 1,
                  minHeight: "400px",
                }}
              >
                <Typography
                  variant="h5"
                  color="#78590C"
                  fontWeight={600}
                  sx={{ mb: 1 }}
                >
                  {isYouthNet ? "YouthNet" : "My Certificates"}
                </Typography>

                <Typography
                  variant="h6"
                  color="#78590C"
                  fontWeight={500}
                  sx={{ mb: 3 }}
                >
                  Completed Courses & Certificates
                </Typography>

                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={4}
                  >
                    <Typography>Loading certificates...</Typography>
                  </Box>
                ) : courseData.length === 0 ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={4}
                    sx={{
                      backgroundColor: "#fff9f0",
                      borderRadius: 2,
                      border: "1px solid #fdbd16",
                    }}
                  >
                    <InfoIcon sx={{ color: "#FDBE16", mr: 2, fontSize: 32 }} />
                    <Typography variant="body1" color="text.secondary">
                      No certificates completed yet. Complete courses to earn
                      certificates.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {/* Test div to see if grid is working */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "lightblue",
                          borderRadius: 1,
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6">
                          Test: Grid is working! Found {courseData.length}{" "}
                          certificates
                        </Typography>
                      </Box>
                    </Grid>

                    {courseData.map((cert: any, index: number) => {
                      console.log(`Rendering certificate ${index}:`, cert);
                      return (
                        <Grid item xs={12} sm={6} lg={4} xl={3} key={index}>
                          <CourseCertificateCard
                            title={cert.program || "Untitled Course"}
                            description={
                              cert.description || "No description available"
                            }
                            imageUrl={
                              cert.posterImage || "/images/image_ver.png"
                            }
                            completionDate={
                              cert.completedOn || new Date().toISOString()
                            }
                            onPreviewCertificate={() =>
                              handlePreview(cert.certificateId)
                            }
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Certificate Modal */}
      <CertificateModal
        certificateId={certificateId}
        open={showCertificate}
        setOpen={setShowCertificate}
      />
    </Layout>
  );
};

export default ProfilePage;
