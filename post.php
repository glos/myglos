<?php
  set_time_limit(120);

  header ("Content-Type:text/xml");
  $r = file_get_contents(wget($_SERVER[QUERY_STRING],file_get_contents('php://input')));
file_put_contents('/tmp/x.xml',$r."\n",FILE_APPEND);

  echo $r;

  function wget($u,$p) {
    $request  = '/tmp/'.rand().time().'.post.xml';
    $response = '/tmp/'.rand().time().'.xml';
    file_put_contents($request,$p);
    `wget --header "Content-Type:text/xml" --post-file=$request '$u' -O $response > /dev/null 2>&1`;
    return $response;
  }
?>
