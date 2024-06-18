import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { arweave, getTopicString } from '../lib/api';

export const NewPost = (props) => {
  const [postValue, setPostValue] = React.useState("");
  const [isPosting, setIsPosting] = React.useState(false);
  const [topicValue, setTopicValue] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(false);

  function onTopicChanged(e) {
    let input = e.target.value;
    let dashedTopic = getTopicString(input);
    setTopicValue(dashedTopic);
  }

  async function onPostButtonClicked() {
    setIsPosting(true);
    let tx = await arweave.createTransaction({ data: postValue });
    tx.addTag('App-Name', 'PublicSquare');
    tx.addTag('Content-Type', 'text/plain');
    tx.addTag('Version', '1.0.1');
    tx.addTag('Type', 'post');
    if (topicValue) {
      tx.addTag('Topic', topicValue);
    }
    try {
      let result = await window.arweaveWallet.dispatch(tx);
      setPostValue("");
      setTopicValue("");
      if (props.onPostMessage) {
        props.onPostMessage(result.id);
      }
    } catch (err) {
      console.error(err);
    }
    setIsPosting(false);
    setIsVisible(false); // Hide the NewPost component after posting
  }

  let isDisabled = postValue === "";

  const toggleNewPost = () => {
    setIsVisible(!isVisible);
  };

  const cancelPost = () => {
    setPostValue("");
    setTopicValue("");
    setIsVisible(false);
  };

  if (props.isLoggedIn) {
    if (isVisible) {
      if (isPosting) {
        return (
          <div className="newPost">
            <div className="newPostScrim" />
            <TextareaAutosize
              value={postValue}
              readOnly={true}
              className="newPost-textarea"
            />
            <div className="newPost-postRow">
              <div className="topic">
                #
                <input
                  type="text"
                  placeholder="topic"
                  className="topicInput"
                  value={topicValue}
                  disabled={true}
                />
              </div>
              <button
                className="submitButton"
                disabled={true}
              >
                Posting...
              </button>
            </div>
            <button className="newPostCancelButton" onClick={cancelPost}>×</button>
          </div>
        );
      } else {
        return (
          <div className="newPost">
            <TextareaAutosize
              value={postValue}
              onChange={e => setPostValue(e.target.value)}
              rows="1"
              placeholder="What's happening?"
              className="newPost-textarea"
            />
            <div className="newPost-postRow">
              <div className="topic">
                #
                <input
                  type="text"
                  placeholder="topic"
                  className="topicInput"
                  value={topicValue}
                  onChange={e => onTopicChanged(e)}
                />
              </div>
              <button
                className="submitButton"
                disabled={isDisabled}
                onClick={onPostButtonClicked}
              >
                Post
              </button>
            </div>
            <button className="newPostCancelButton" onClick={cancelPost}>×</button>
          </div>
        );
      }
    } else {
      return (
        <button className="newPostButton" onClick={toggleNewPost}>
          New Post +
        </button>
      );
    }
  } else {
    return (
      <div className="newPost-darkRow" onClick={props.connectWallet}>
        Connect your wallet to start posting...
      </div>
    );
  }
};
