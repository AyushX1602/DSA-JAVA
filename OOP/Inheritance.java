class Pokemon{
    int power;
    String type;
    Pokemon(int power,String type){
        this.power = power;
        this.type = type;
    }
    pokemon(){}
    void print(){
        System.out.println("Power: "+this.power);
        System.out.println("Type: "+this.type);
    }
}
class LegendaryPokemon extends Pokemon{
    String ability;
}
public class Inheritance {
    public static void main(String[] args) {
        LegendaryPokemon mewtwo = new LegendaryPokemon();
        mewtwo.ability = "Psychic";
        Pokemon p1 = new Pokemon(100,"Fire");
        p1.print();
    }
}