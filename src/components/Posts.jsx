import React from 'react';
import { Link } from 'react-router-dom';
import { maxMessageLength, abbreviateAddress, getPostTime } from '../lib/api';

export const Posts = (props) => {
  return (
    <div>
      {props.postInfos.map(postInfo =>
        <PostItem key={postInfo.txid} postInfo={postInfo} />
      )}
    </div>
  )
};

const PostItem = (props) => {

  const getAccountInfo = async () => {
    setOwnerName(abbreviateAddress(props.postInfo.owner));
    const info = await props.postInfo.account;
    setOwnerName(info.handle);
    if (info.handle[0] === '@') {
      props.postInfo.imgSrc = info.profile.avatarURL;
      setImgSrc(info.profile.avatarURL);
      setOwnerName(info.profile.name);
      setOwnerHandle(info.handle);
    }
  }
  getAccountInfo();

  const [postMessage, setPostMessage] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerHandle, setOwnerHandle] = React.useState("");
  const [imgSrc, setImgSrc] = React.useState(props.postInfo.imgSrc || 'img_avatar.png');
  const [upvotes, setUpvotes] = React.useState(props.postInfo.upvotes || 0);
  const [downvotes, setDownvotes] = React.useState(props.postInfo.downvotes || 0);
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [isDownvoted, setIsDownvoted] = React.useState(false);

  React.useEffect(() => {
    let newPostMessage = "";
    let newStatus = "";

    if (!props.postInfo.message) {
      setStatusMessage("loading...");
      let isCancelled = false;

      const getPostMessage = async () => {
        setPostMessage('s'.repeat(Math.min(Math.max(props.postInfo.length - 75, 0), maxMessageLength)));
        const response = await props.postInfo.request;
        switch (response?.status) {
          case 200:
          case 202:
            props.postInfo.message = response.data.toString();
            newStatus = "";
            newPostMessage = props.postInfo.message;
            break;
          case 404:
            newStatus = "Not Found";
            break;
          default:
            newStatus = props.postInfo?.error;
            if (!newStatus) {
              newStatus = "missing data";
            }
        }

        if (isCancelled)
          return;

        setPostMessage(newPostMessage);
        setStatusMessage(newStatus);
      }

      if (props.postInfo.error) {
        setPostMessage("");
        setStatusMessage(props.postInfo.error);
      } else {
        getPostMessage();
      }
      return () => isCancelled = true;
    }

  }, [props.postInfo]);

  const renderTopic = (topic) => {
    if (topic)
      return (<Link to={`/topics/${topic}`} className="postTopic">#{topic}</Link>)
  }

  const handleUpvote = () => {
    if (!isUpvoted) {
      setUpvotes(upvotes + 1);
      setIsUpvoted(true);
      if (isDownvoted) {
        setDownvotes(downvotes - 1);
        setIsDownvoted(false);
      }
    } else {
      setUpvotes(upvotes - 1);
      setIsUpvoted(false);
    }
  };

  const handleDownvote = () => {
    if (!isDownvoted) {
      setDownvotes(downvotes + 1);
      setIsDownvoted(true);
      if (isUpvoted) {
        setUpvotes(upvotes - 1);
        setIsUpvoted(false);
      }
    } else {
      setDownvotes(downvotes - 1);
      setIsDownvoted(false);
    }
  };

  return (
    <div className="postItem">
      <div className="postLayout">
        <div className="profileImageWrapper">
          <img className="profileImage" src={imgSrc} alt="ProfileImage" />
          <time className="postTime">{getPostTime(props.postInfo.timestamp)}</time>
        </div>
        <div className="postContent">
          <div className="postOwnerRow">
            <Link to={`/users/${props.postInfo.owner}`} className="ownerName">{ownerName}</Link>
            <span className="gray"> <span className="handle">{ownerHandle}</span></span>
          </div>
          <div className="postRow">
            {props.postInfo.message || postMessage}
            {statusMessage && <div className="status"> {statusMessage}</div>}
            {renderTopic(props.postInfo.topic)}
          </div>
          <div className="twitterText">
            <div className="voteButtons">
              <button className={`upvoteButton ${isUpvoted ? 'upvoted' : ''}`} onClick={handleUpvote}>
                <span className="voteIcon">&#9650;</span> Upvote
              </button>
              <span className="voteCount">{upvotes}</span>
              <button className={`downvoteButton ${isDownvoted ? 'downvoted' : ''}`} onClick={handleDownvote}>
                <span className="voteIcon">&#9660;</span> Downvote
              </button>
              <span className="voteCount">{downvotes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
