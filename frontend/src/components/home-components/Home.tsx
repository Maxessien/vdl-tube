import Search from "./Search";

const Home = () => {
  return (
    <main className="mx-auto w-full max-w-lg px-2 pt-20 gap-4">
      {/* <VideoPlayer
        posterUrl=""
        title="Post to be - Omarion"
        url="/Omarion Ft. Chris Brown _ Jhene Aiko - Post To Be (Official Music Video)(720P_HD).mp4"
      /> */}
      <h1 className="text-3xl text-(--text-primary) mb-4 w-full text-center font-semibold">
        VDL Tube
      </h1>
      <Search />
    </main>
  );
};

export default Home;
