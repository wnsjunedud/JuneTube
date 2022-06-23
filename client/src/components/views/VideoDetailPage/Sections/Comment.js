import React, { useState } from 'react'
//import { Button, Input } from 'antd';
import Axios from 'axios';
import { useSelector } from 'react-redux'; // use id
//const { textArea } = Input;
import SingleComment from './SingleComment'
import ReplyComment from './ReplyComment';

function Comment(props) {

    const videoId = props.postId;
    const user = useSelector(state => state.user); //redux/state/user - userid
    const [commentValue, setCommentValue] = useState("")

    const handleClick = (event) => {
        setCommentValue(event.currentTarget.value) // handClick
    }

    const onSubmit = (event) => {
        event.preventDefault();

        const variables = {
            content: commentValue,
            writer: user.userData._id,
            postId: props.postId
        };

        Axios.post('/api/comment/saveComment', variables)
            .then(response => {
                if (response.data.success) {
                    //console.log(response.data.result)
                    setCommentValue("")
                    props.refreshFunction(response.data.result);
                } else {
                    alert('Failed to save Comment');
                }
            })
    }
    
    return (
        <div>
            <br />
            <p> Replies </p>
            <hr />

            {/* Comment Lists  */}

            {/*console.log(props.commentLists)*/}

            {props.commentLists && props.commentLists.map((comment, index) => (
                (!comment.responseTo  &&
                    <React.Fragment key={comment._id}>
                        <SingleComment 
                        refreshFunction={props.refreshFunction} 
                        comment={comment} 
                        postId={videoId}  />
                        <ReplyComment
                        parentCommentId={comment._id}
                        postId={videoId}
                        commentLists={props.commentLists} 
                        refreshFunction={props.refreshFunction} />
                    </React.Fragment>
                )
                
            ))}
                
            {/* Root Comment Form */}

            <form style={{ display: 'flex' }} onSubmit={onSubmit}>
                <textarea
                    style={{ width: '100%', borderRadius: '5px' }}
                    onChange={handleClick}
                    value={commentValue}
                    placeholder="Write some comments "
                />
                <br />
                <button style={{ width: '20%', height: '52px' }} onClick={onSubmit}>Submit</button>
            </form>

        </div>
    )
}

export default Comment
