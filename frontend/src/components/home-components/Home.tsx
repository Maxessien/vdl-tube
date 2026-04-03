import Search from "./Search";

const Home = () => {
  return (
    // <main className={"mx-auto w-full px-2 pt-20 gap-4" + " md:grid md:grid-cols-[70%_30%] gap-3 justify-between"}>
    //   <div className="h-full max-h-screen max-w-full aspect-video pb-5">
    //     <VideoPlayer
    //       posterUrl=""
    //       title="Post to be - Omarion"
    //       urls={["/Omarion Ft. Chris Brown _ Jhene Aiko - Post To Be (Official Music Video)(720P_HD) - Copy.mp4"]}
    //     />
    //   </div>
    //   <div>
    //     <h1 className="text-3xl text-(--text-primary) mb-4 w-full text-center font-semibold">
    //       VDL Tube
    //     </h1>
    //     <Search />
    //   </div>
    // </main>
    <main className="mx-auto w-full max-w-lg px-2 pt-20 gap-4">
      <h1 className="text-3xl text-(--text-primary) mb-4 w-full text-center font-semibold">
        VDL Tube
      </h1>
      <Search />
    </main>
  );
};

export default Home;
