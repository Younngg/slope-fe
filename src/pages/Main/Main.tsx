import { useEffect, useState } from "react";
import Map from "../../components/Map/Map";
import Navbar from "../../components/Navbar/Navbar";
import BottomSheet from "../../components/ui/BottomSheet";
import Container from "../../components/ui/Container";
import useGeoLocation from "../../hooks/geoLocation";
import { Bookmark, Facility } from "../../types/facility";
import { Road } from "../../types/road";
import FacilityInfo from "../../components/FacilityInfo/FacilityInfo";
import ModalPortal from "../../components/ui/ModalPortal";
import Modal from "../../components/ui/Modal";
import FacilityMarkers from "../../components/FacilityMarkers/FacilityMarkers";
import RoadMarkers from "../../components/RoadMarkers/RoadMarkers";
import BookmarkMarkers from "../../components/BookmarkMarkers/BookmarkMarkers";
import Categories from "../../components/Categories/Categories";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import SearchBar from "../../components/SearchBar/SearchBar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import RoadTroubleModal from "../../components/RoadTroubleModal/RoadTroubleModal";
import RoadReportCallModal from "../../components/RoadReportCallModal/RoadReportCallModal";
import RoadCenterListModal from "../../components/RoadCenterListModal/RoadCenterListModal";
import CallTaxiModal from "../../components/CallTaxiModal/CallTaxiModal";
import { RoadReportDetail } from "../../types/roadReportDetail";
import { RoadReportCenter } from "../../types/roadReportCenter";
import { RoadReportCallTaxi } from "../../types/RoadReportCallTaxi";
import { serverUrl } from "../../constant/url";
import axiosInstance from "../../service/axiosInstance";
import { getCookie } from "../../service/cookieUtils";

const Main = () => {
  const { location } = useGeoLocation();

  const navigate = useNavigate();

  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [clickedId, setClickedId] = useState<number>(0);
  const [roadClickId, setRoadClickedId] = useState<number | null>(null);
  const [map, setMap] = useState<any>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [visibleBookmarks, setVisibleBookmarks] = useState(false);
  const [roads, setRoads] = useState<any[]>([]);
  const [visibleRoads, setVisibleRoads] = useState(false);
  const [roadReport, setRoadReport] = useState<RoadReportDetail>(Object);
  const [requestRoad, setRequestRoad] = useState<Road>(Object);
  const [roadReportCenter, setRoadReportCenter] =
    useState<RoadReportCenter>(Object);
  const [complaintCenterList, setComplaintCenterList] = useState<any[]>([]);
  const [callTaxi, setCallTaxi] = useState<RoadReportCallTaxi>(Object);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  /*
   1. isRoadOpen - 첫 번째 도로 모달
   2. isComplaintCallOpen - 두 번째 '민원' 클릭 시 모달
   3. isCenterListOpen - 민원> '기관목록' 클릭 시 모달
   4. iscallTaxiOpen - 두 번째 '콜택시' 클릭 시 모달
  */
  const [isRoadOpen, setIsRoadOpen] = useState(false);
  const [isComplaintCallOpen, setIsComplaintCallOpen] = useState(false);
  const [isCenterListOpen, setIsCenterListOpen] = useState(false);
  const [iscallTaxiOpen, setIscallTaxiOpen] = useState(false);

  useEffect(() => {
    searchParams.get("id") && setBottomSheetOpen(true);
  }, [searchParams]);

  // 도로 마커 클릭 시에만 요청
  useEffect(() => {
    const fetchRoadReport = async () => {
      if (roadClickId !== null) {
        try {
          const roadResponse = await axios.get<Road>(
            `${serverUrl}/api/roads/${roadClickId}`,
          );
          const roadData = roadResponse.data;
          setRequestRoad(roadData);

          const response = await axios.get(
            `${serverUrl}/api/roadReport/info/${roadClickId}`,
          );
          setRoadReport(response.data);
          setIsRoadOpen(true);
        } catch (error) {
          console.error(
            "로드 상세 정보를 불러오는 데 오류가 발생했습니다. :",
            error,
          );
        }
      }
    };

    fetchRoadReport();
  }, [roadClickId]);

  useEffect(() => {
    // 즐겨찾기를 받아오는 로직
    const getBookmarks = async () => {
      const { data } = await axiosInstance.get(
        `${serverUrl}/api/users/bookmark`,
      );

      setBookmarks(data);
    };
    getCookie("accessToken") && getBookmarks();
  }, [visibleBookmarks]);

  useEffect(() => {
    // 불편 지역을 받아오는 로직
    const getRoadsData = async () => {
      try {
        const response = await axios.get<Road[]>(
          `${serverUrl}/api/roads/get-points?latitude=${location && center.lat === 0 ? location.lat : center ? center.lat : 37.566481622437934}&longitude=${location && center.lng === 0 ? location.lng : center ? center.lng : 126.98502302169841}&distance_meters=50&limit=20`,
        );
        setRoads(response.data);
      } catch (error) {
        console.error("데이터를 불러오는 데 오류가 발생했습니다.:", error);
      }
    };

    visibleRoads && getRoadsData();
  }, [visibleRoads, location, map, center]);

  useEffect(() => {
    const getByCategory = async () => {
      // 카테고리별로 장소를 받아오는 로직
      const currentCategory = searchParams.get("category");

      map &&
        map.addListener("dragend", () => {
          const center = map.getCenter();
          setCenter({ lng: center._lng, lat: center._lat });
        });

      const { data } = await axios.get(
        `${serverUrl}/api/facilities?latitude=${location && center.lat === 0 ? location.lat : center ? center.lat : 37.566481622437934}&longitude=${location && center.lng === 0 ? location.lng : center ? center.lng : 126.98502302169841}&distance_meters=50&limit=20${currentCategory !== "all" && currentCategory !== null && currentCategory !== "" ? "&type=" + currentCategory : ""}`,
      );

      setFacilities(data);
    };

    getByCategory();
  }, [bookmarks, location, searchParams, visibleBookmarks, map, center]);

  const openBottomSheet = () => {
    setBottomSheetOpen(true);
  };

  const closeBottomSheet = () => {
    setBottomSheetOpen(false);
  };

  const onClickMarkerForBottomSheet = (id: number) => {
    closeBottomSheet();
    setClickedId(id);
    openBottomSheet();
  };

  const onClickMarkerForModal = async (id: number) => {
    console.log(id);
    closeBottomSheet();
    setRoadClickedId(id);
  };

  // 도로 모달 > '민원' 클릭 시
  const handleRoadModalState = async () => {
    setIsRoadOpen(false);
    setIsComplaintCallOpen(true);
    if (requestRoad) {
      console.log(requestRoad);
      try {
        const response = await axios.post<RoadReportCenter>(
          `${serverUrl}/api/roadReport/connect-center`,
          requestRoad,
        );
        setRoadReportCenter(response.data);
      } catch (error) {
        console.error(
          "Error sending road data or fetching report centers:",
          error,
        );
      }
    }
  };

  // 기존 두 번째 민원 모달 닫기
  const handleComplaintCallModalState = () => {
    setIsComplaintCallOpen(false);
  };
  // 두번째 모달 - 기관 목록 클릭 시 기관목록 모달
  const handleCenterListModalState = async () => {
    setIsComplaintCallOpen(false);
    try {
      const response = await axios.get<RoadReportCenter[]>(
        `${serverUrl}/api/roadReport/get-centerList`,
      );
      setComplaintCenterList(response.data);
      setIsCenterListOpen(true);
    } catch (error) {
      console.error(
        "Error sending road data or fetching report centers:",
        error,
      );
    }
  };
  // 기존 도로 모달 닫고 택시 모달 open
  const handleCallTaxiModalState = async () => {
    setIsRoadOpen(false);
    setIscallTaxiOpen(true);
    if (requestRoad) {
      try {
        const response = await axios.post<RoadReportCallTaxi>(
          `${serverUrl}/api/roadReport/connect-callTaxi`,
          requestRoad,
        );
        setCallTaxi(response.data);
      } catch (error) {
        console.error(
          "Error sending road data or fetching report centers:",
          error,
        );
      }
    }
  };

  return (
    <>
      <Container hasHeader={false} hasNav={true}>
        <div
          className="relative"
          onClick={(e) => {
            if (e.target instanceof HTMLCanvasElement) {
              closeBottomSheet();
              setClickedId(10);
              setSearchParams({ category: searchParams.get("category") || "" });
            }
          }}
        >
          <div className="absolute z-10 flex flex-col gap-3 px-3 pt-3 w-full select-none">
            <SearchBar />
            <Categories
              onClick={() => {
                closeBottomSheet();
                setClickedId(10);
              }}
            />
            <RightSidebar
              visibleBookmarks={visibleBookmarks}
              visibleRoads={visibleRoads}
              onClickRoads={() => setVisibleRoads(!visibleRoads)}
              onClickBookmarks={() => setVisibleBookmarks(!visibleBookmarks)}
            />
          </div>
          <Map
            map={map}
            setMap={setMap}
            currentLocation={location}
            height="calc(100vh - 64px)"
            setClickedId={(id: number) => setClickedId(id)}
          >
            <FacilityMarkers
              map={map}
              clickedId={clickedId}
              facilities={facilities}
              onClick={onClickMarkerForBottomSheet}
            />
            {visibleRoads && (
              <RoadMarkers
                map={map}
                clickedId={clickedId}
                roads={roads}
                onClick={onClickMarkerForModal}
              />
            )}
            {visibleBookmarks && (
              <BookmarkMarkers
                map={map}
                clickedId={clickedId}
                bookmarks={bookmarks}
                onClick={onClickMarkerForBottomSheet}
              />
            )}
          </Map>
          {searchParams.get("id") && (
            <BottomSheet isOpen={isBottomSheetOpen} onClose={closeBottomSheet}>
              <FacilityInfo id={Number(searchParams.get("id"))} />
            </BottomSheet>
          )}
          <Navbar />
        </div>
      </Container>
      {/* 1. 통행 불편 모달 open */}
      {isRoadOpen && (
        <ModalPortal>
          <Modal
            onClose={() => setIsRoadOpen(false)}
            height="700px"
            width="450px"
          >
            <RoadTroubleModal
              roadReport={roadReport}
              callTaxiModalFunc={handleCallTaxiModalState}
              stateChangeFunc={handleRoadModalState}
            />
          </Modal>
        </ModalPortal>
      )}
      {/* 2. 민원 모달 open */}
      {isComplaintCallOpen && (
        <ModalPortal>
          <Modal
            onClose={() => setIsComplaintCallOpen(false)}
            height="250px"
            width="350px"
          >
            <RoadReportCallModal
              complaintCenter={roadReportCenter}
              complaintCallState={isComplaintCallOpen}
              stateChangeFunc={handleComplaintCallModalState}
              centerListSetState={handleCenterListModalState}
            ></RoadReportCallModal>
          </Modal>
        </ModalPortal>
      )}
      {/* 3. 기관목록 모달 open */}
      {isCenterListOpen && (
        <ModalPortal>
          <Modal
            height="600px"
            width="420px"
            onClose={() => setIsCenterListOpen(false)}
          >
            <RoadCenterListModal
              centerList={complaintCenterList}
              centerListState={isCenterListOpen}
              stateChangeFunc={handleCenterListModalState}
            ></RoadCenterListModal>
          </Modal>
        </ModalPortal>
      )}
      {/* 4. 콜택시 모달 open */}
      {iscallTaxiOpen && (
        <ModalPortal>
          <Modal
            width="380px"
            height="220px"
            onClose={() => setIscallTaxiOpen(false)}
          >
            <CallTaxiModal callTaxi={callTaxi}></CallTaxiModal>
          </Modal>
        </ModalPortal>
      )}
    </>
  );
};

export default Main;
