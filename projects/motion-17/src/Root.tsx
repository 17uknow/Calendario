import "./index.css";
import { Composition, staticFile } from "remotion";
import { Overlay } from "./Overlay";
import { LocationPill } from "./LocationPill";
import { SubscribeAnimation } from "./SubscribeAnimation";
import { CdjScene } from "./CdjScene";
import { LockScreenWidget } from "./LockScreenWidget";
import { ExpandedPlayer } from "./ExpandedPlayer";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Overlay"
        component={Overlay}
        durationInFrames={75}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LocationPill"
        component={LocationPill}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ text: "Madrid - A Coruña" }}
      />
      <Composition
        id="SubscribeAnimation"
        component={SubscribeAnimation}
        durationInFrames={120}
        fps={30}
        width={700}
        height={200}
      />
      <Composition
        id="CdjScene"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Above The Cloud (Original Mix)",
          artistName: "17.",
          coverSrc: staticFile("profile-17.png"),
          bpm: 124.3,
        }}
      />
      <Composition
        id="CdjScene-NoEsNormal"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "No Es Normal",
          artistName: "D.Valentino, Sneaky wh, 17.",
          coverSrc: staticFile("cover-no-es-normal.jpg"),
          bpm: 96,
        }}
      />
      <Composition
        id="CdjScene-Pelijroso"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Pelijroso",
          artistName: "9Louro, Yuly",
          coverSrc: staticFile("cover-pelijroso.png"),
          bpm: 170,
        }}
      />
      <Composition
        id="CdjScene-DaMe"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Da Me",
          artistName: "BadGyal",
          coverSrc: staticFile("cover-da-me.png"),
          bpm: 180,
        }}
      />
      <Composition
        id="CdjScene-MaquinaCulona"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Máquina Culona",
          artistName: "Ralphie Choo, Mura Masa",
          coverSrc: staticFile("cover-maquina-culona.png"),
          bpm: 102,
        }}
      />
      <Composition
        id="CdjScene-BadVoy"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Bad Voy",
          artistName: "Grecas",
          coverSrc: staticFile("cover-bad-voy.png"),
          bpm: 104,
        }}
      />
      <Composition
        id="CdjScene-Tititi"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Tititi",
          artistName: "Eflexx, Enry-K, D.Valentino",
          coverSrc: staticFile("cover-tititi.png"),
          bpm: 110,
        }}
      />
      <Composition
        id="CdjScene-ComeNGo"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "COMË N GO",
          artistName: "Yeat",
          coverSrc: staticFile("cover-come-n-go.png"),
          bpm: 130,
        }}
      />
      <Composition
        id="CdjScene-PlieReleve"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Plié Relevé",
          artistName: "ABHIR",
          coverSrc: staticFile("cover-plie-releve.png"),
          bpm: 127,
        }}
      />
      <Composition
        id="CdjScene-Soltera"
        component={CdjScene}
        durationInFrames={300}
        fps={30}
        width={625}
        height={717}
        defaultProps={{
          trackTitle: "Soltera",
          artistName: "D.Valentino, Sneaky wh, 17.",
          coverSrc: staticFile("cover-soltera.jpg"),
          bpm: 135,
        }}
      />
      <Composition
        id="Lock-NoEsNormal"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "No Es Normal",
          artistName: "D.Valentino, Sneaky wh, 17.",
          coverSrc: staticFile("cover-no-es-normal.jpg"),
        }}
      />
      <Composition
        id="Lock-Pelijroso"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "Pelijroso",
          artistName: "9Louro, Yuly",
          coverSrc: staticFile("cover-pelijroso.png"),
        }}
      />
      <Composition
        id="Lock-DaMe"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "Da Me",
          artistName: "BadGyal",
          coverSrc: staticFile("cover-da-me.png"),
        }}
      />
      <Composition
        id="Lock-MaquinaCulona"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "Máquina Culona",
          artistName: "Ralphie Choo, Mura Masa",
          coverSrc: staticFile("cover-maquina-culona.png"),
        }}
      />
      <Composition
        id="Lock-BadVoy"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "Bad Voy",
          artistName: "Grecas",
          coverSrc: staticFile("cover-bad-voy.png"),
        }}
      />
      <Composition
        id="Lock-Tititi"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "Tititi",
          artistName: "Eflexx, Enry-K, D.Valentino",
          coverSrc: staticFile("cover-tititi.png"),
        }}
      />
      <Composition
        id="Lock-ComeNGo"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "COMË N GO",
          artistName: "Yeat",
          coverSrc: staticFile("cover-come-n-go.png"),
        }}
      />
      <Composition
        id="Lock-PlieReleve"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "Plié Relevé",
          artistName: "ABHIR",
          coverSrc: staticFile("cover-plie-releve.png"),
        }}
      />
      <Composition
        id="Lock-Soltera"
        component={LockScreenWidget}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          trackTitle: "Soltera",
          artistName: "D.Valentino, Sneaky wh, 17.",
          coverSrc: staticFile("cover-soltera.jpg"),
        }}
      />
      <Composition
        id="Expanded-NoEsNormal"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "No Es Normal",
          artistName: "D.Valentino, Sneaky wh, 17.",
          coverSrc: staticFile("cover-no-es-normal.jpg"),
        }}
      />
      <Composition
        id="Expanded-Pelijroso"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "Pelijroso",
          artistName: "9Louro, Yuly",
          coverSrc: staticFile("cover-pelijroso.png"),
        }}
      />
      <Composition
        id="Expanded-DaMe"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "Da Me",
          artistName: "BadGyal",
          coverSrc: staticFile("cover-da-me.png"),
        }}
      />
      <Composition
        id="Expanded-MaquinaCulona"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "Máquina Culona",
          artistName: "Ralphie Choo, Mura Masa",
          coverSrc: staticFile("cover-maquina-culona.png"),
        }}
      />
      <Composition
        id="Expanded-BadVoy"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "Bad Voy",
          artistName: "Grecas",
          coverSrc: staticFile("cover-bad-voy.png"),
        }}
      />
      <Composition
        id="Expanded-Tititi"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "Tititi",
          artistName: "Eflexx, Enry-K, D.Valentino",
          coverSrc: staticFile("cover-tititi.png"),
        }}
      />
      <Composition
        id="Expanded-ComeNGo"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "COMË N GO",
          artistName: "Yeat",
          coverSrc: staticFile("cover-come-n-go.png"),
        }}
      />
      <Composition
        id="Expanded-PlieReleve"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "Plié Relevé",
          artistName: "ABHIR",
          coverSrc: staticFile("cover-plie-releve.png"),
        }}
      />
      <Composition
        id="Expanded-Soltera"
        component={ExpandedPlayer}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1500}
        defaultProps={{
          trackTitle: "Soltera",
          artistName: "D.Valentino, Sneaky wh, 17.",
          coverSrc: staticFile("cover-soltera.jpg"),
        }}
      />
    </>
  );
};
