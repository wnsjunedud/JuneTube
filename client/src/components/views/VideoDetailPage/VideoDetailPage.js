import React, { useEffect, useState } from 'react'
import { Row, Col, List, Avatar } from 'antd';
import Axios from 'axios';
import SideVideo from './Sections/SideVideo';
import Subscribe from './Sections/Subscribe';
import Comment from './Sections/Comment';
import LikeDislikes from './Sections/LikeDislikes';

function VideoDetailPage(props) {

    const videoId = props.match.params.videoId;
    const variable = { videoId: videoId };
    
    const [VideoDetail, setVideoDetail] = useState([])
    const [Comments, setComments] = useState([])
    const [Views, setViews] = useState(0);

    useEffect(() => {

        Axios.post('/api/video/getVideoDetail', variable)
        .then(response => {
            if (response.data.success) {
                //console.log(response.data.videoDetail)
                setVideoDetail(response.data.videoDetail)
            } else {
                alert('Failed to Get Video Info')
            }
        })

        Axios.post('/api/comment/getComments', variable)
        .then(response => {
            if (response.data.success) {
                setComments(response.data.comments)
                //console.log(response.data.comments)
            } else {
                alert('Failed to Get Comment Info')
            }
        })

    Axios.post("/api/video/updateViews", variable)
    .then(response => {
        if (response.data.success) {
          setViews(response.data.views)
        } else {
          console.log("Failed to count views.")
        }
      })

},[])

    const refreshFunction = (newComment) => {
        setComments(Comments.concat(newComment))
    }

    if(VideoDetail.writer) {
        console.log(VideoDetail)
        
        const subscribeButton = VideoDetail.writer._id !== localStorage.getItem('userId') && <Subscribe userTo={VideoDetail.writer._id} userFrom={localStorage.getItem('userId')} />

     return (
        <Row gutter={[16, 16]}>
            <Col lg={18} xs={24}>

                <div style={{ width: '100%', padding: '3rem 4em' }}>
                    <video style={{ width: '100%' }} src={`http://localhost:5000/${VideoDetail.filePath}`} controls />

                    <List.Item
                        actions={[<LikeDislikes 
                            video userId = {localStorage.getItem('userId')} 
                            videoId = {videoId}/>, subscribeButton]}
                    >
                        <List.Item.Meta
                                avatar={<Avatar src={VideoDetail.writer.image} />}
                                title={VideoDetail.writer.name}
                                description={VideoDetail.description}
                        />
                        
                    </List.Item>

                    {/*Comments*/}
                    <Comment refreshFunction={refreshFunction} commentLists={Comments} postId={videoId} />
                    
                </div>
                
            </Col>
            <Col lg={6} xs={24}>
               <SideVideo />
            </Col>
        </Row>
     )
    } else{
        return(
            <div>...loading</div>
        )
    }
}

export default VideoDetailPage
